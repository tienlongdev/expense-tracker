# 💰 Expense Tracker

Personal Finance Management App built with **.NET 10** + **Next.js 15**.

---

## 🏗️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | .NET 10, ASP.NET Core, EF Core    |
| Database   | SQL Server 2022                   |
| Frontend   | Next.js 15, TypeScript            |
| UI         | Tailwind CSS v4, shadcn/ui        |
| Container  | Docker, Docker Compose            |

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   └── src/
│       ├── ExpenseTracker.API           # Controllers, Program.cs
│       ├── ExpenseTracker.Application   # DTOs, Services, Interfaces
│       ├── ExpenseTracker.Domain        # Entities, Enums, Interfaces
│       └── ExpenseTracker.Infrastructure # DbContext, Repositories
├── frontend/
│   └── src/
│       ├── app/                         # Next.js pages
│       ├── components/                  # UI Components
│       ├── hooks/                       # Custom hooks
│       ├── lib/                         # API client, utils
│       └── types/                       # TypeScript types
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option A — Docker Compose (Recommended)

```bash
# Clone repo
git clone https://github.com/your-username/expense-tracker.git
cd expense-tracker

# Run all services
docker-compose up --build

# Open browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/openapi
```

### Option B — Local Development

**Backend:**
```bash
cd backend

# Restore & migrate
dotnet restore
dotnet ef database update \
  --project src/ExpenseTracker.Infrastructure \
  --startup-project src/ExpenseTracker.API

# Run
cd src/ExpenseTracker.API
dotnet run
# → http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/transaction` | Get all |
| GET    | `/api/transaction/{id}` | Get by ID |
| POST   | `/api/transaction` | Create |
| PUT    | `/api/transaction/{id}` | Update |
| DELETE | `/api/transaction/{id}` | Delete |
| GET    | `/api/transaction/filter/date?date=` | Filter by date |
| GET    | `/api/transaction/filter/month?year=&month=` | Filter by month |
| GET    | `/api/transaction/filter/year?year=` | Filter by year |
| GET    | `/api/transaction/summary` | Overall summary |
| GET    | `/api/transaction/summary/month?year=&month=` | Monthly summary |
| GET    | `/api/transaction/summary/year?year=` | Yearly summary |
| GET    | `/api/transaction/report/yearly?year=` | Yearly report |

---

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/` | Summary + chart + recent |
| Transactions | `/transactions` | Full CRUD list |
| Calendar | `/calendar` | View by date |
| Report | `/report` | Yearly analysis |

---

## ⚙️ Environment Variables

**Backend** (`appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ExpenseTrackerDb;..."
  }
}
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
