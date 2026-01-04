# Starter Kit Node Nest React Antd

Monorepo containing the backend (NestJS) and frontend (React + Ant Design) for the Starter Kit Node Nest React Antd project. Use this root folder as the single Git repository; commit both apps together.

## Project Structure
- `backend/` — NestJS API, MongoDB, auth/RBAC, file upload, options.
- `frontend/` — React/Vite UI with Ant Design.

## Getting Started
```bash
git clone https://github.com/khalidzaibi/nest-react-antd-boilerplate.git
cd nest-react-antd-boilerplate

# Backend
cd backend
cp .env.example .env
npm install
npm run start:dev

# Frontend (new shell)
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

## Environment
- Backend variables live in `backend/.env` (see `backend/.env.example`).
- Frontend variables live in `frontend/.env` (see `frontend/.env.example`).

## Git Workflow
- Keep the whole repo in this root so backend and frontend stay in sync.
- Commit changes from the root (e.g., `git status`, `git add backend frontend`, `git commit`).
- Push from the root to ensure both apps are versioned together.

## Author
- Khalid Zaibi
