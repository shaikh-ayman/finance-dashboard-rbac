from pathlib import Path
import sys

from sqlalchemy import text

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.database import engine

def print_columns(table):
    with engine.connect() as conn:
        db = conn.execute(text("SELECT DATABASE()")).scalar()
        res = conn.execute(
            text(
                "SELECT COLUMN_NAME FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table"
            ),
            {"schema": db, "table": table}
        ).all()
        print(f"{table}: {[row[0] for row in res]}")

if __name__ == "__main__":
    print_columns("users")
    print_columns("financial_records")
