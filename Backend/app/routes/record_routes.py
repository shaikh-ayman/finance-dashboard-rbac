from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.record_schema import RecordCreate, RecordListResponse, RecordResponse
from app.services.record_service import (
    create_record_service,
    list_records_service,
    update_record_service,
    delete_record_service,
    get_recent_activity_service
)
from app.utils.role_checker import role_required

router = APIRouter(prefix="/records", tags=["Records"])


@router.post("/", response_model=RecordResponse)
def create_record(
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["admin"]))
):
    return create_record_service(data, db, current_user.id)


@router.get("/", response_model=RecordListResponse)
def get_records(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["analyst", "admin"])),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1)
):
    return list_records_service(
        db,
        page=page,
        limit=limit,
        type=type,
        category=category,
        search=search,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/recent", response_model=List[RecordResponse])
def recent_activity(
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["analyst", "admin"])),
    limit: int = Query(6, ge=1, le=20)
):
    return get_recent_activity_service(db, limit)


@router.put("/{record_id}", response_model=RecordResponse)
def update_record(
    record_id: int,
    data: RecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["admin"]))
):
    return update_record_service(record_id, data, db)


@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(role_required(["admin"]))
):
    return delete_record_service(record_id, db)
