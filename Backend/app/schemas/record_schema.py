from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from typing import Optional, List


class RecordCreate(BaseModel):
    amount: float
    type: str  # income / expense
    category: str
    date: date
    recipient: Optional[str] = Field(None, description="Counterparty, payee, or sender")
    description: Optional[str] = None


class RecordResponse(BaseModel):
    id: int
    amount: float
    type: str
    category: str
    recipient: Optional[str]
    date: date
    description: Optional[str]
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class RecordListResponse(BaseModel):
    data: List[RecordResponse]
    total: int
    page: int
    totalPages: int

    model_config = ConfigDict(from_attributes=True)
