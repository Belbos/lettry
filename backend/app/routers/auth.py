import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.rate_limit import limiter
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import (
    create_access_token,
    generate_temp_password,
    hash_password,
    verify_password,
)
from app.services.email import EmailError, send_email

log = logging.getLogger("auth")

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/check-username/{username}")
@limiter.limit("30/minute")
def check_username(request: Request, username: str, db: Session = Depends(get_db)):
    exists = (
        db.scalar(select(User).where(User.username == username.strip().lower()))
        is not None
    )
    return {"available": not exists}


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, req: RegisterRequest, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.username == req.username)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 사용 중인 아이디입니다",
        )
    if db.scalar(select(User).where(User.email == req.email)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 사용 중인 이메일입니다",
        )
    # Bootstrap-only admin promotion: grant admin to the configured initial
    # username, but only while no admin exists yet. This closes the window so
    # the env var can never be used as a permanent backdoor once set up.
    grant_admin = False
    if (
        settings.initial_admin_username
        and req.username == settings.initial_admin_username.strip().lower()
    ):
        admin_exists = db.scalar(select(User.id).where(User.is_admin.is_(True)))
        grant_admin = admin_exists is None
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
        is_admin=grant_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(User.username == req.username.strip().lower())
    )
    if user is None or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다",
        )
    token = create_access_token(user.id, user.username)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)):
    return user


# Generic response — never reveals whether the username exists (anti-enumeration).
_FORGOT_OK = {
    "message": "해당 아이디가 존재하면 등록된 이메일로 임시 비밀번호를 보냈습니다."
}


@router.post("/forgot-password")
@limiter.limit("5/minute")
def forgot_password(
    request: Request, req: ForgotPasswordRequest, db: Session = Depends(get_db)
):
    user = db.scalar(
        select(User).where(User.username == req.username.strip().lower())
    )
    if user is None:
        # Same response regardless, to avoid leaking which usernames exist.
        return _FORGOT_OK

    temp_password = generate_temp_password()
    body = (
        f"안녕하세요, {user.username}님.\n\n"
        f"요청하신 임시 비밀번호는 다음과 같습니다:\n\n"
        f"    {temp_password}\n\n"
        f"이 임시 비밀번호로 로그인한 뒤 반드시 새 비밀번호로 변경해 주세요.\n"
        f"본인이 요청하지 않았다면 이 메일을 무시하세요.\n"
    )
    try:
        send_email(user.email, "[Lotto Advisor] 임시 비밀번호 안내", body)
    except EmailError:
        # Don't change the password if the email couldn't be sent — otherwise the
        # account would be locked out. Keep the response generic.
        log.error("password reset email failed for user id=%s", user.id)
        return _FORGOT_OK

    # Only persist the new (hashed) temp password after the email went out.
    user.hashed_password = hash_password(temp_password)
    user.must_reset_password = True
    db.commit()
    return _FORGOT_OK


@router.post("/reset-password", response_model=UserResponse)
@limiter.limit("10/minute")
def reset_password(
    request: Request,
    req: ResetPasswordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not verify_password(req.temp_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="임시 비밀번호가 올바르지 않습니다",
        )
    user.hashed_password = hash_password(req.new_password)
    user.must_reset_password = False
    db.commit()
    db.refresh(user)
    return user
