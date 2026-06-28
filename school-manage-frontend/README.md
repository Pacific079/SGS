# School Manage Frontend + Backend (Dev)

This workspace contains a Vite React frontend and a minimal Express backend (MySQL). The backend uses `mysql2` and requires a local MySQL server.

Quick start:

1. Install frontend deps and start dev server

```bash
cd c:\Users\hcrga\school-manage-frontend
npm install
npm run dev    # runs Vite on port 3000
```

2. Install backend deps and start server (in another terminal)

```bash
cd backend
npm install
# copy .env.example to .env and update DB credentials
node server.js
# or for dev with auto reload
npm run dev
```

3. Initialize the database (MySQL)

```sql
-- from mysql client or workbench
SOURCE backend/schema.sql;
```

Frontend expects the backend at `http://localhost:5000`. Set `VITE_API_BASE` in `.env` if different.
