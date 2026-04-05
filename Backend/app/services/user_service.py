from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User
from app.models.financial_record import FinancialRecord
from app.schemas.user_schema import UserCreate, UserUpdate
from app.utils.auth import hash_password



def create_user_service(user: UserCreate, db: Session):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password or "password"),
        role=user.role,
        is_active=user.is_active
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_all_users_service(db: Session):
    return db.query(User).order_by(User.created_at.desc()).all()


def update_user_service(user_id: int, payload: UserUpdate, db: Session):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.email and payload.email != user.email:
        duplicate = db.query(User).filter(User.email == payload.email).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="Email already exists")

    if payload.name:
        user.name = payload.name
    if payload.email:
        user.email = payload.email
    if payload.role:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.password = hash_password(payload.password)

    db.commit()
    db.refresh(user)
    return user


def delete_user_service(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.query(FinancialRecord).filter(FinancialRecord.user_id == user_id).delete(synchronize_session=False)
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
