# Finance dashboard
Full-stack finance dashboard with FastAPI backend, MySQL persistence, JWT/OTP access control, and a React + Tailwind frontend.

## Architecture
1. **Backend** (`Backend/`)
   * FastAPI app with modular routers for users, records, dashboard analytics, and authentication.
   * SQLAlchemy ORM + MySQL (`mysql+pymysql` driver).
   * JWT access tokens (`app.utils.auth`) and role-based dependencies (`app.utils.role_checker`).
   * OTP login for `viewer` and `analyst` roles via `POST /auth/request-otp` + `/auth/verify-otp` (stub email sender prints to console and returns OTP in the response).
   * Schemas based on Pydantic v2, plus response models, validator logic, and enum-aware filters.
   * Schema bootstrapping in `database.py` ensures `created_at`, `recipient`, and `notes` columns exist before ORM migrations run.

2. **Frontend** (`Frontend/`)
   * Vite + React 19 app styled with Tailwind + custom UI components.
   * `/login` page offers tabs for Admin (password), Analyst and Viewer (OTP) flows; OTP card surfaces the code while email delivery is mocked.
   * Axios client (`src/api/client.js`) injects the JWT into `Authorization` headers and exposes helper `saveToken`.
   * Data layer (`src/data/store.js`) proxies backend APIs with recipients, pagination, and roles-based guard helpers.
   * Pages include dashboard charts, transactions table (with filters, pagination, recipient column, modals), analytics, and user management.

## Setup
1. **Backend**
   ```bash
   cd Backend
   pip install -r requirements.txt
   # ensure MySQL database exists; .env controls credentials
   uvicorn app.main:app --app-dir Backend --reload
   ```
2. **Env file**
   `Backend/.env` must include:
   ```env
   password="your_mysql_password"
   database="finance_db"
   records_table="financial_records"
   ```
3. **Ensure schema**
   ```bash
   cd Backend
   python scripts/ensure_columns.py
   ```
4. **Frontend**
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```

## Authentication Flows
* `POST /users/login` → email & password login for admin + analyst.
* `POST /auth/request-otp` → send OTP to email (viewers/analysts only); backend logs + returns OTP.
* `POST /auth/verify-otp` → returns JWT if OTP matches.
* Token stored in `localStorage` and sent automatically via Axios interceptor.

## APIs you can call
* `/users/*` – CRUD + `/users/me`.
* `/records/*` – create/view/update/delete records with filters, recipient text, pagination metadata.
* `/dashboard/*` – summary, category-wise, monthly trends, recent activity.
* `/auth/*` – OTP request/verify.

## Assumptions & Trade-offs
* OTP storage is in-memory (`auth_service.py`), so codes expire on restart; swap to Redis for production.
* `send_email` currently prints OTP; replace with SMTP/service integration when ready.
* Deleting a user manually removes their records to satisfy the existing FK instead of relying on `ON DELETE CASCADE`.
* Frontend demo data uses `admin@example.com`/`analyst@example.com`/`user@example.com` with shared password `123456`.

## Running Tests & Next Steps
* No automated tests included yet; consider adding backend pytest suites and frontend component/unit tests.
* Consider moving OTP storage/emailing into dedicated services and exposing configurable flags in `.env`.
