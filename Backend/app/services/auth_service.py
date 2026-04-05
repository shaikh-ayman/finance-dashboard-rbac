from datetime import datetime, timedelta
import random
import string

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.auth import create_access_token
from app.utils.email import send_email

OTP_STORE: dict[str, dict] = {}
OTP_TTL = timedelta(minutes=5)
OTP_MAX_ATTEMPTS = 5
ALLOWED_OTP_ROLES = {"viewer", "analyst"}


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


def request_otp(email: str, role: str, db: Session) -> dict:
    if role not in ALLOWED_OTP_ROLES:
        raise HTTPException(status_code=400, detail="OTP not allowed for this role")

    user = db.query(User).filter(User.email == email, User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="Viewer account not found")

    entry = OTP_STORE.get(email)
    now = datetime.utcnow()
    if entry and entry.get("attempts", 0) >= OTP_MAX_ATTEMPTS and entry["expiry"] > now:
        raise HTTPException(status_code=429, detail="Too many OTP requests, try again later")

    if not entry or entry["expiry"] <= now:
        otp = _generate_otp()
    else:
        otp = entry["otp"]

    expiry = now + OTP_TTL
    OTP_STORE[email] = {
        "otp": otp,
        "expiry": expiry,
        "attempts": entry.get("attempts", 0) + 1 if entry else 1,
        "role": role
    }

    send_email(
        email,
        subject="FinVault OTP Login",
        body=f"Your one-time password is {otp}. It expires in 5 minutes."
    )

    return {"detail": "OTP sent to registered email", "otp": otp}


def verify_otp(email: str, otp: str, role: str, db: Session) -> dict:
    entry = OTP_STORE.get(email)
    now = datetime.utcnow()
    if not entry or entry["expiry"] <= now or entry["otp"] != otp or entry.get("role") != role:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == email, User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="Viewer account not found")

    OTP_STORE.pop(email, None)
    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}
