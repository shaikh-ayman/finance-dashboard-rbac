from sqlalchemy import Column, Integer, String, ForeignKey, Date, Enum, DECIMAL, Text
from sqlalchemy.orm import relationship
from app.models.base import Base
import enum


class RecordType(str, enum.Enum):
    income = "income"
    expense = "expense"


class FinancialRecord(Base):
    __tablename__ = "financial_records"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    amount = Column(DECIMAL(10, 2), nullable=False)
    type = Column(Enum(RecordType), nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    recipient = Column(String(200), nullable=True)
    description = Column("notes", Text, nullable=True)

    user = relationship("User")
