from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, UserUpdate, TokenResponse
from app.services.user_service import (
    create_user_service,
    get_all_users_service,
    update_user_service,
    delete_user_service
)
from app.utils.auth import create_access_token, verify_password
from app.utils.role_checker import role_required, get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"user_id": user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user



@router.post("/")
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    return create_user_service(user, db)
@router.get("/", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user=Depends(role_required(["admin"]))):
    return get_all_users_service(db)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current_user=Depends(role_required(["admin"]))):
    return update_user_service(user_id, payload, db)


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(role_required(["admin"]))):
    return delete_user_service(user_id, db)


@router.put("/{user_id}/role")
def update_role(user_id: int, role: str, db: Session = Depends(get_db), current_user=Depends(role_required(["admin"]))):
    return update_user_service(user_id, UserUpdate(role=role), db)
