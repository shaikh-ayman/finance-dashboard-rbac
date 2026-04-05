from sqlalchemy.orm import Session
from sqlalchemy import func, case, extract
import calendar

from app.models.financial_record import FinancialRecord, RecordType


def get_summary_service(db: Session):
    total_income = db.query(func.sum(FinancialRecord.amount))\
        .filter(FinancialRecord.type == RecordType.income)\
        .scalar() or 0

    total_expense = db.query(func.sum(FinancialRecord.amount))\
        .filter(FinancialRecord.type == RecordType.expense)\
        .scalar() or 0

    balance = total_income - total_expense
    transaction_count = db.query(func.count(FinancialRecord.id)).scalar() or 0

    return {
        "totalIncome": float(total_income),
        "totalExpenses": float(total_expense),
        "netBalance": float(balance),
        "transactionCount": transaction_count
    }


def get_category_summary_service(db: Session):
    income_sum = func.sum(case((FinancialRecord.type == RecordType.income, FinancialRecord.amount), else_=0)).label("income")
    expense_sum = func.sum(case((FinancialRecord.type == RecordType.expense, FinancialRecord.amount), else_=0)).label("expense")

    results = db.query(
        FinancialRecord.category,
        income_sum,
        expense_sum
    ).group_by(FinancialRecord.category).all()

    return [
        {
            "category": category,
            "income": float(income or 0),
            "expense": float(expense or 0)
        }
        for category, income, expense in results
    ]


def get_monthly_trends_service(db: Session):
    income_sum = func.sum(case((FinancialRecord.type == RecordType.income, FinancialRecord.amount), else_=0)).label("income")
    expense_sum = func.sum(case((FinancialRecord.type == RecordType.expense, FinancialRecord.amount), else_=0)).label("expense")

    results = db.query(
        extract("year", FinancialRecord.date).label("year"),
        extract("month", FinancialRecord.date).label("month"),
        income_sum,
        expense_sum
    ).group_by("year", "month").order_by("year", "month").all()

    return [
        {
            "year": int(year),
            "month": int(month),
            "income": float(income or 0),
            "expense": float(expense or 0),
            "monthLabel": f"{calendar.month_name[int(month)]} {int(year)}"
        }
        for year, month, income, expense in results
    ]

