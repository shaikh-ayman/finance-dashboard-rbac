from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.database import init_db  # ? our DB function
from app.models import user, financial_record  
from app.routes import user_routes , record_routes , dashboard_routes , auth_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Create tables on application startup if they don't exist."""
    try:
        init_db()   # ? THIS will create tables
    except Exception as error:
        print(f"Error ensuring tables exist: {error}")


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(record_routes.router)
app.include_router(dashboard_routes.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
