from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.record_schema import RecordResponse
from app.services.dashboard_service import (
    get_summary_service,
    get_category_summary_service,
    get_monthly_trends_service
)
from app.services.record_service import get_recent_activity_service
from app.utils.role_checker import role_required

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["viewer", "analyst", "admin"]))
):
    return get_summary_service(db)


@router.get("/category-wise")
def get_category_summary(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["viewer", "analyst", "admin"]))
):
    return get_category_summary_service(db)


@router.get("/monthly-trends")
def get_monthly_trends(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["viewer", "analyst", "admin"]))
):
    return get_monthly_trends_service(db)


@router.get("/recent", response_model=List[RecordResponse])
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["viewer", "analyst", "admin"])),
    limit: int = Query(6, ge=1, le=20)
):
    return get_recent_activity_service(db, limit)
