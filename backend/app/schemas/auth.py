import re
from datetime import datetime

from pydantic import BaseModel, field_validator, model_validator


class RegisterRequest(BaseModel):
    username: str
    password: str
    password_confirm: str
    email: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3 or len(v) > 30:
            raise ValueError("아이디는 3~30자여야 합니다")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다")
        # Case-insensitive uniqueness: store/compare in lowercase.
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("비밀번호는 8자 이상이어야 합니다")
        # bcrypt only uses the first 72 bytes; reject longer to avoid silent
        # truncation and a 500 from the hashing backend.
        if len(v.encode("utf-8")) > 72:
            raise ValueError("비밀번호는 72바이트(영문 기준 72자) 이하여야 합니다")
        return v

    @field_validator("email")
    @classmethod
    def email_valid(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", v):
            raise ValueError("올바른 이메일 형식이 아닙니다")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.password_confirm:
            raise ValueError("비밀번호가 일치하지 않습니다")
        return self


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}
