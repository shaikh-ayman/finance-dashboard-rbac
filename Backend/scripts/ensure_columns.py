from pathlib import Path
import sys

from sqlalchemy import text

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.database import engine


def _column_exists(conn, table, column):
    db = conn.execute(text("SELECT DATABASE()")).scalar()
    result = conn.execute(
        text(
            "SELECT 1 FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table AND COLUMN_NAME = :column"
        ),
        {"schema": db, "table": table, "column": column}
    ).scalar()
    return bool(result)


def ensure_column_added():
    with engine.begin() as conn:
        if not _column_exists(conn, "users", "created_at"):
            conn.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN created_at DATETIME(6) NULL"
                )
            )
            conn.execute(
                text(
                    "UPDATE users SET created_at = CURRENT_TIMESTAMP "
                    "WHERE created_at IS NULL"
                )
            )
            print("Added users.created_at column")
        else:
            print("users.created_at already exists")

        if not _column_exists(conn, "financial_records", "recipient"):
            conn.execute(
                text(
                    "ALTER TABLE financial_records "
                    "ADD COLUMN recipient VARCHAR(200)"
                )
            )
            print("Added financial_records.recipient column")
        else:
            print("financial_records.recipient already exists")

        if not _column_exists(conn, "financial_records", "notes"):
            conn.execute(
                text(
                    "ALTER TABLE financial_records "
                    "ADD COLUMN notes TEXT"
                )
            )
            print("Added financial_records.notes column")
        else:
            print("financial_records.notes already exists")


if __name__ == "__main__":
    ensure_column_added()
