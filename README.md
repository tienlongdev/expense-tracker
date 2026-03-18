# 💰 Expense Tracker

Ứng dụng quản lý tài chính cá nhân — Monorepo

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | .NET 10 Web API + Clean Architecture|
| Frontend  | Next.js 14 + TypeScript + Tailwind  |
| Database  | SQL Server + EF Core                |
| DevOps    | Docker + Docker Compose             |

## Cấu trúc dự án

```
expense-tracker/
├── backend/      # .NET 10 Web API
├── frontend/     # Next.js App Router
├── docker-compose.yml
└── README.md
```

## Chạy dự án

```bash
docker-compose up --build
```