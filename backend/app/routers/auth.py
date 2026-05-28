from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/check-username/{username}")
def check_username(username: str, db: Session = Depends(get_db)):
    exists = db.scalar(select(User).where(User.username == username)) is not None
    return {"available": not exists}


@router.post("/register", response_model=UserResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
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
    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == req.username))
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
