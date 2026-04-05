from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth_schema import OTPRequest, OTPVerify, TokenResponse
from app.services.auth_service import request_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/request-otp", summary="Request OTP for viewer login")
def otp_request(payload: OTPRequest, db: Session = Depends(get_db)):
    return request_otp(payload.email, payload.role, db)


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify viewer OTP")
def otp_verify(payload: OTPVerify, db: Session = Depends(get_db)):
    return verify_otp(payload.email, payload.otp, payload.role, db)
