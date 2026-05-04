# 🚀 Braj Accounting: Launch Guide

Welcome to the **Braj Accounting** ecosystem. Follow these steps to get the full-stack application running with all its premium features.

## 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (Optional, fallbacks to SQLite automatically)

## 2. Backend Setup
The backend serves the API and manages the multi-tenant database.

```bash
cd backend
npm install
# Ensure .env is configured (or use default for SQLite)
npm run dev
```
*The backend will run on `http://localhost:3000`.*

## 3. Frontend Setup
The frontend is a premium Next.js 15 application.

```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:3001` to avoid port conflicts.*

## 4. Key Features to Explore
- **Command Palette**: Press `Ctrl + K` anywhere to navigate.
- **Activity Sidebar**: Press `Ctrl + Shift + A` to see recent actions.
- **Smart Narration**: Use `Ctrl + Shift + N` in the Voucher Entry page.
- **Premium Print**: Press `Ctrl + P` on a voucher detail page.
- **3D Refraction**: Move your mouse to see the background tilt.

## 5. Development Notes
- **Tenancy**: The app uses `x-company-id` headers for data isolation.
- **SQLite Fallback**: If no `DATABASE_URL` is found in `backend/.env`, the app creates a `braj_accounting.db` file automatically.
- **Type Safety**: Use `npx tsc --noEmit` in both directories to verify types.

---
*Happy Accounting!*
