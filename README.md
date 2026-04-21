# Attendance Management System

Stack:
- Backend: Java 17 + Spring Boot + MySQL + JWT
- Frontend: React + TypeScript + Vite + MUI
- Photos: Cloudinary (photo per company role)

## 1) MySQL setup

Create database:
```sql
CREATE DATABASE attendance;
```

## 2) Backend setup (Spring Boot)

From `backend/`:
```powershell
mvn spring-boot:run
```

Environment variables (PowerShell example):
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/attendance?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata"
$env:DB_USER="root"
$env:DB_PASS="YOUR_PASSWORD"

# Use a long random secret (32+ chars)
$env:JWT_SECRET="change-this-to-a-long-random-secret-32-chars-min"

# Optional: seed initial admin (created once if not exists)
$env:INIT_ADMIN_USERNAME="YOUR_ADMIN_USERNAME"
$env:INIT_ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"

# Optional: seed initial HR login (created once if not exists)
$env:INIT_HR_USERNAME="YOUR_HR_USERNAME"
$env:INIT_HR_PASSWORD="YOUR_HR_PASSWORD"

# Optional: working-days config
$env:DEFAULT_JOIN_DATE="2026-01-19"
# Weekly holidays are set by Admin in the UI (stored in DB)

# Optional: Cloudinary (needed only for company role photo uploads)
$env:CLOUDINARY_CLOUD_NAME="YOUR_CLOUD_NAME"
$env:CLOUDINARY_API_KEY="YOUR_API_KEY"
$env:CLOUDINARY_API_SECRET="YOUR_API_SECRET"
```

Admin seeding (first run only): set `INIT_ADMIN_USERNAME` + `INIT_ADMIN_PASSWORD`.

## 3) Frontend setup (React)

From `frontend/`:
```powershell
npm install
npm run dev
```

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8081
```

## 4) How it works

- Admin:
  - Create Company Roles and upload Role Photo
  - Create HR login
  - Create Employee (employee number + name + login + company role)
  - Set default In/Out time and weekly holidays (weekends)
  - Add festival holidays (shows as `H`)
- HR:
  - Mark/Update attendance with `inTime` and `outTime` (defaults set by Admin)
  - Mark Leave (L) for a date
  - Bulk update a date range (e.g. Jan 19 -> today) with same in/out time
  - Upload daily group photo for a selected date
  - Status is `P` if worked time >= full day threshold, `HD` if >= half day threshold, else `L`
- Employee:
  - Select month and view calendar
  - `P` shows in green, `HD` shows in amber, `L` shows in red
  - `H` shows in purple (holiday)

## Notes

- Do not commit secrets (DB password, Cloudinary keys, JWT secret). Keep them in environment variables or `.env` files.
- Weekly holidays (weekends) are configured by Admin and shown as `H`.
- Festival holidays are configured by Admin and shown as `H`.
