from pydantic import BaseModel, EmailStr, Field


class OTPRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address for OTP login")
    role: str = Field("viewer", description="Role allowed to use this OTP")


class OTPVerify(BaseModel):
    email: EmailStr = Field(..., description="Email address used to request OTP")
    otp: str = Field(..., min_length=6, max_length=6, description="Six-digit OTP")
    role: str = Field("viewer", description="Role expected to verify this OTP")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
