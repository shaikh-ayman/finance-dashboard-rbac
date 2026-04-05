from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
import os
from dotenv import load_dotenv

load_dotenv()  # Loads .env file contents
DATABASE_URL = f"mysql+pymysql://root:{os.getenv('password')}@localhost:3306/{os.getenv('database')}"

engine = create_engine(
    DATABASE_URL,
    echo=True  # shows SQL queries (useful for debugging)
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _column_exists(conn, table: str, column: str) -> bool:
    schema = engine.url.database
    result = conn.execute(
        text(
            "SELECT 1 FROM information_schema.COLUMNS "
            "WHERE TABLE_SCHEMA = :schema AND TABLE_NAME = :table AND COLUMN_NAME = :column"
        ),
        {"schema": schema, "table": table, "column": column}
    ).scalar()
    return bool(result)


def ensure_schema():
    with engine.begin() as conn:
        if not _column_exists(conn, "users", "created_at"):
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP"
            ))
        if not _column_exists(conn, "financial_records", "recipient"):
            conn.execute(text(
                "ALTER TABLE financial_records ADD COLUMN recipient VARCHAR(200)"
            ))
        if not _column_exists(conn, "financial_records", "notes"):
            conn.execute(text(
                "ALTER TABLE financial_records ADD COLUMN notes TEXT"
            ))


def init_db():
    ensure_schema()
    Base.metadata.create_all(bind=engine)
