from datetime import datetime
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(..., description="Human-readable user name")
    email: EmailStr = Field(..., description="Unique email address for login")


class UserCreate(UserBase):
    password: str = Field("password", min_length=6, description="Plain text password")
    role: str = Field("viewer", description="Role identifier")
    is_active: bool = Field(True, description="Initial activation state")


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Display name")
    email: Optional[EmailStr] = Field(None, description="Email address")
    role: Optional[str] = Field(None, description="Role identifier")
    is_active: Optional[bool] = Field(None, description="Activation status")
    password: Optional[str] = Field(None, min_length=6, description="Plain text password")


class UserRead(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


UserResponse = UserRead


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
