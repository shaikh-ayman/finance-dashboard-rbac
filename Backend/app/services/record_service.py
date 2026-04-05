from typing import Optional
import math

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, String

from app.models.financial_record import FinancialRecord, RecordType
from app.schemas.record_schema import RecordCreate


def create_record_service(data: RecordCreate, db: Session, user_id: int):
    new_record = FinancialRecord(user_id=user_id, **data.dict())

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


def build_record_query(db: Session, *, type: Optional[str] = None, category: Optional[str] = None,
                       start_date=None, end_date=None, search: Optional[str] = None):
    query = db.query(FinancialRecord)

    if type:
        try:
            parsed_type = RecordType(type)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid record type")
        query = query.filter(FinancialRecord.type == parsed_type)
    if category:
        query = query.filter(FinancialRecord.category == category)
    if start_date:
        query = query.filter(FinancialRecord.date >= start_date)
    if end_date:
        query = query.filter(FinancialRecord.date <= end_date)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                FinancialRecord.description.ilike(pattern),
                FinancialRecord.category.ilike(pattern),
                func.cast(FinancialRecord.amount, String).ilike(pattern)
            )
        )

    return query


def list_records_service(db: Session, *, page: int = 1, limit: int = 10, **filters):
    query = build_record_query(db, **filters)

    total = query.count()
    records = query.order_by(FinancialRecord.date.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "data": records,
        "total": total,
        "page": page,
        "totalPages": math.ceil(total / limit) if limit else 1
    }


def get_recent_activity_service(db: Session, limit: int = 5):
    return db.query(FinancialRecord).order_by(FinancialRecord.date.desc()).limit(limit).all()


def update_record_service(record_id: int, data: RecordCreate, db: Session):
    record = db.query(FinancialRecord).filter(FinancialRecord.id == record_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    for key, value in data.dict().items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)

    return record


def delete_record_service(record_id: int, db: Session):
    record = db.query(FinancialRecord).filter(FinancialRecord.id == record_id).first()

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    db.delete(record)
    db.commit()

    return {"message": "Record deleted successfully"}
