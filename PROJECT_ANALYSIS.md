# Project Analysis - Expense Tracker

## 1. System Overview

### Application purpose
Expense Tracker is a personal finance management application that tracks:
- Income and expense transactions
- Transaction categories
- Monthly budgets by expense category
- Debts and repayments
- Savings and investment accounts
- In-app notifications related to salary, budget milestones, and weekly summaries

The repository README identifies the product as a personal finance management app built with .NET and Next.js. The implemented source confirms that the application is centered on individual financial tracking rather than team, business accounting, or shared household workflows.

### Intended users
- Primary target user appears to be an individual managing personal finances
- The seeded data and Vietnamese labels indicate a consumer-oriented, single-person finance product
- Not found in current source: explicit user personas, onboarding copy, multi-user support, or organization support

### Main user flows
The current source supports the following end-to-end flows:

1. Track transactions
- View transaction list
- Filter by title, date range, and type
- Create, edit, and delete transactions
- View transactions by date, month, and year
- View daily transactions in a calendar

2. Manage categories
- View all categories
- Filter categories by income or expense
- Create custom categories
- Edit categories
- Delete non-default categories

3. Plan and monitor budgets
- View monthly budget records and overview
- Create monthly budget per category
- Edit and delete budgets
- Copy budgets from one month to another
- View yearly budget overview

4. Manage debt
- Create debt records
- Edit debt metadata
- Track borrowed versus lent money
- Add repayment/payment records
- View overdue items
- View debt summary aggregates

5. Manage savings and investments
- Create savings or investment accounts
- Edit account metadata
- Add deposits
- Withdraw value
- Update account value
- Add interest
- Close account
- Review account history
- View savings summary

6. Consume notifications
- View notifications
- Mark single notification as read
- Mark all as read
- Delete notifications

7. View dashboard and reports
- View monthly summary cards
- View recent transactions
- View monthly chart data
- View yearly report table
- View yearly category breakdown

### Core business goals inferred from source
- Centralize personal finance records across multiple domains
- Provide visibility into cash flow through summaries and reports
- Support planning through budgets
- Support asset and liability tracking through savings and debt modules
- Surface important events through lightweight notifications

### Product scope boundaries visible in source
- No authentication or user account management
- No bank integration
- No OCR, receipt import, CSV import, or export
- No push notification infrastructure
- No real-time sync infrastructure beyond shared backend persistence
- No offline-first architecture in web source

## 2. Frontend Analysis

### Stack and framework
Frontend stack from source:
- Next.js App Router application
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui and Radix-based UI primitives
- next-themes for dark/light theme toggling

Relevant files:
- `frontend/package.json`
- `frontend/src/app/layout.tsx`
- `frontend/src/lib/api.ts`

### Routing and navigation
Navigation is defined in the sidebar component with the following routes:
- `/` Dashboard
- `/transactions`
- `/calendar`
- `/report`
- `/budget`
- `/debt`
- `/savings`
- `/category`

The layout wraps the app in:
- Sidebar navigation
- Desktop top bar with notification bell and theme toggle
- Mobile top bar with slide-out sidebar

### Pages and screens currently implemented

#### Dashboard
Path:
- `frontend/src/app/page.tsx`

Capabilities:
- Monthly summary cards
- Monthly bar chart
- Recent transactions
- Month selector for dashboard context

Data sources:
- `useSummary({ type: "month", year, month })`
- `useTransactions()`
- `useYearlyReport(year)`

#### Transactions
Path:
- `frontend/src/app/transactions/page.tsx`

Capabilities:
- Paginated transaction list
- Filter by title
- Filter by date range
- Filter by transaction type
- Create transaction dialog
- Edit transaction dialog
- Delete transaction action
- Inline summary of current filtered page totals

Data sources:
- `useTransactions(query)`
- `useTransactionMutations(refetch)`

#### Calendar
Path:
- `frontend/src/app/calendar/page.tsx`

Capabilities:
- Monthly calendar grid
- Daily transaction dots by income and expense presence
- Month navigation
- Day detail panel
- Derived month income, expense, balance

Data source:
- `transactionApi.getByMonth(currentYear, currentMonth)`

#### Report
Path:
- `frontend/src/app/report/page.tsx`

Capabilities:
- Year selector
- Yearly summary cards
- Monthly bar chart
- Category breakdown for income and expense
- Yearly summary table

Data sources:
- `useYearlyReport(year)`
- `useTransactionFilter({ type: "year", year })`
- `useSummary({ type: "year", year })`

#### Budget
Path:
- `frontend/src/app/budget/page.tsx`

Capabilities:
- Month selector
- Monthly budget summary cards
- Budget list
- Create budget dialog
- Edit budget dialog
- Delete budget action
- Copy budget from source month to target month

Data sources:
- `useBudget(year, month)`
- `useCategories(TransactionType.Expense)`

#### Debt
Path:
- `frontend/src/app/debt/page.tsx`

Capabilities:
- Debt summary cards
- Tabs for all, borrowed, lent, overdue
- Create debt dialog
- Edit debt dialog
- Add payment dialog
- Delete debt action

Data source:
- `useDebt()`

#### Savings
Path:
- `frontend/src/app/savings/page.tsx`

Capabilities:
- Savings summary cards
- Tabs for all, active, closed
- Create account dialog
- Edit account dialog
- Deposit, withdraw, update value, add interest dialogs
- Close account action
- Delete account action
- View history dialog

Data source:
- `useSavings()`
- direct `savingsApi.getHistory(accountId)` inside page logic

#### Category
Path:
- `frontend/src/app/category/page.tsx`

Capabilities:
- Category counts
- Tabs for all, income, expense
- Create category dialog
- Edit category dialog
- Delete category action

Data source:
- `useCategories()`

#### Notifications UI
Path:
- `frontend/src/components/layout/NotificationBell.tsx`

Capabilities:
- Poll notifications every 60 seconds
- Unread badge
- Mark single notification as read
- Mark all as read
- Delete is supported at API layer but not visible in bell UI
- Relative time display

### Main frontend features by domain
- Dashboard and yearly reports
- CRUD flows for transactions, categories, budgets, debts, savings accounts
- Monthly calendar transaction visualization
- Notification center as dropdown
- Theme toggle
- Mobile-responsive navigation shell

### Form and validation behavior
Forms are implemented through React components and rely mostly on backend validation.
Observed frontend validation patterns:
- Transactions page validates filters only through input types and backend responses
- Dialogs catch API errors and show inline error messages or alerts
- Budget, debt, savings, and category pages all capture mutation errors from backend and display them
- HTML input types are used for dates and numbers
- Not found in current source: dedicated schema validation library such as Zod, Yup, React Hook Form, or Formik

Assumption: Most field-level validation is implemented within the individual form components such as `TransactionForm`, `BudgetForm`, `DebtForm`, and `SavingsAccountForm`, but the current analysis is based on page-level and hook-level source plus API contracts.

### State management
State management is lightweight and local:
- React `useState`
- React `useEffect`
- React `useCallback`
- Custom hooks wrapping API requests and mutations

There is no global client store such as:
- Redux
- Zustand
- MobX
- TanStack Query
- SWR

This means:
- Fetching is manually coordinated
- Refetch after mutations is explicit
- Caching is minimal and local to mounted components

### How frontend calls backend
All backend communication goes through a small wrapper in:
- `frontend/src/lib/api.ts`

Characteristics:
- Uses `fetch`
- Sets `Content-Type: application/json`
- Throws error from `error.message` if response is not OK
- Treats `204` as no-content
- Uses `NEXT_PUBLIC_API_URL` base URL
- Does not attach authorization headers
- Does not implement refresh logic, retries, or request cancellation abstraction

Domain-specific API clients:
- `transaction-api.ts`
- `category-api.ts`
- `budget-api.ts`
- `debt-api.ts`
- `savings-api.ts`
- `notification-api.ts`

### Frontend observations important for mobile
- The frontend already maps cleanly to domain-specific API clients, which is favorable for mobile API layer design
- The web app is strongly CRUD-oriented and endpoint-driven, with very little frontend-only business logic
- Notification UI is dropdown-centric, which is web-specific and will need re-mapping to native inbox or push UX
- Some screens are page-oriented and compacted for desktop layouts; mobile should break them into list/detail/action flows

## 3. Backend Analysis

### Stack and framework
Backend stack from source:
- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- Npgsql provider for PostgreSQL
- Quartz.NET for scheduled jobs
- OpenAPI enabled in development

Relevant source:
- `backend/src/ExpenseTracker.API/Program.cs`
- `backend/src/ExpenseTracker.Infrastructure/Data/AppDbContext.cs`

### General architecture
The backend uses a layered architecture:
- `ExpenseTracker.API`: controllers and application bootstrap
- `ExpenseTracker.Application`: DTOs, service interfaces, service implementations
- `ExpenseTracker.Domain`: entities, enums, repository interfaces
- `ExpenseTracker.Infrastructure`: EF Core DbContext, repository implementations, migrations, Quartz job

This is a standard controller-service-repository structure.

### Modules and features
Implemented backend modules:
- Transactions
- Categories
- Budget
- Debt
- Savings
- Notifications

There is no module for:
- Users
- Authentication
- Authorization policies
- File storage
- Audit logs
- Device registration
- Push delivery

### Domain entities
Entities implemented in source:
- `Category`
- `Transaction`
- `Budget`
- `Debt`
- `DebtPayment`
- `SavingsAccount`
- `SavingsHistory`
- `Notification`

Not found in current source:
- `User`
- `Account`
- `Session`
- `RefreshToken`
- `Profile`
- `Organization`
- `Device`

### Services / use cases
Application services exist for each module:
- `ITransactionService` / `TransactionService`
- `ICategoryService` / `CategoryService`
- `IBudgetService` / `BudgetService`
- `IDebtService` / `DebtService`
- `ISavingsService` / `SavingsService`
- `INotificationService` / `NotificationService`

#### TransactionService responsibilities
- Create, update, delete, query transactions
- Aggregate summary totals
- Produce yearly report
- Trigger notifications for:
  - budget alerts on expense creation
  - salary-received notification when the category is the seeded salary category

#### CategoryService responsibilities
- CRUD for categories
- Prevent deletion of default categories

#### BudgetService responsibilities
- CRUD for budget records
- Enforce expense-only category budgeting
- Enforce unique budget per category per month
- Produce monthly and yearly overview
- Bulk upsert budget records
- Copy budget data from one month to another

#### DebtService responsibilities
- CRUD for debts
- Query by type, status, overdue
- Compute debt summary
- Add payment and update remaining balance and status

#### SavingsService responsibilities
- CRUD for savings accounts
- Create initial history entry on account creation
- Manage deposit, withdrawal, interest, and value update
- Close account
- Produce savings summary
- Load account history

#### NotificationService responsibilities
- Query and mutate notification read state
- Trigger budget milestone notifications
- Trigger salary received notifications
- Trigger weekly summary notifications
- Deduplicate notifications via deduplication key

### Authentication and authorization flow
Not found in current source:
- Authentication middleware setup
- Authorization policies
- JWT bearer configuration
- Login or registration controller
- Identity tables or related models
- Per-user resource scoping

Observed facts:
- `Program.cs` contains `app.UseAuthorization();`
- `Program.cs` does not contain `AddAuthentication` or `UseAuthentication`
- Controllers do not use `[Authorize]`
- Entities do not contain `UserId`
- Frontend does not send auth tokens

Conclusion:
- Current backend behaves as an unauthenticated API
- All stored data is effectively global to the application database

### Error handling
Error handling is local and controller-specific.
Patterns in controllers:
- Return `BadRequest` for validation and invalid enum values
- Return `NotFound` if entity is missing
- Return `Conflict` for duplicate monthly budget on create
- Catch `InvalidOperationException` and map to `BadRequest` in several controllers
- Catch `KeyNotFoundException` and map to `NotFound` where appropriate

Not found in current source:
- Global exception middleware
- RFC7807 problem details standardization
- Error codes or typed error contracts
- Request correlation IDs

### Validation
Validation exists at multiple layers.

#### DTO validation
DTOs use data annotations such as:
- `[Required]`
- `[Range]`
- `[MaxLength]`
- `[MinLength]`

This is present in:
- transaction DTOs
- category DTOs
- budget DTOs
- debt DTOs
- savings DTOs

#### Controller validation
Controllers explicitly check:
- `ModelState.IsValid`
- enum validity for route parameters
- month boundaries
- paging constraints
- date range order

#### Service-level business validation
Services enforce additional rules such as:
- budget only for expense categories
- unique budget per category-month
- cannot delete default category
- cannot overpay debt
- cannot delete debt after payment activity
- cannot withdraw more than current savings value
- cannot mutate closed savings account

### Persistence and database setup
Persistence details:
- EF Core `AppDbContext`
- PostgreSQL configured via Npgsql
- Migrations in infrastructure project
- Auto-migration on application start
- Database seed runs on startup if tables are empty

Tables configured in `AppDbContext`:
- Categories
- Transactions
- Debts
- DebtPayments
- SavingsAccounts
- SavingsHistories
- Budgets
- Notifications

Relationship details:
- Transaction -> Category uses `DeleteBehavior.Restrict`
- DebtPayment -> Debt uses cascade delete
- SavingsHistory -> SavingsAccount uses cascade delete
- Budget -> Category uses cascade delete

Important schema rule:
- Unique index on `Budget(CategoryId, Year, Month)`

### Seeded data
Startup seeds:
- Default income and expense categories
- Sample transactions
- Sample debts
- Sample savings accounts and history
- Sample budgets

The seed data uses fixed GUIDs for default categories, including a fixed salary category GUID that is later used in notification logic.

### Scheduling and background work
Quartz job:
- `WeeklySummaryJob`
- Runs every Sunday at 21:00 UTC
- Creates weekly expense summary notifications

Not found in current source:
- Queue infrastructure
- retry/backoff policies for background tasks
- recurring mature-savings updates
- overdue debt reminder scheduler

## 4. API Inventory

### Notes
- Auth required is `No` for all discovered endpoints
- Request and response shapes below are derived from controllers, DTOs, and frontend usage
- Frontend usage describes where the web app calls the endpoint
- Notes for mobile suitability focus on reuse quality and mobile constraints

### Transactions API

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | Frontend Usage | Notes for Mobile Suitability |
|---|---|---|---|---|---|---|---|
| GET | `/api/transaction` | Get paged transaction list with optional filters | No | None | `PagedResultDto<TransactionDto>` with `items`, `totalCount`, `page`, `pageSize`, `totalPages` | `useTransactions`, transactions page | Good for mobile list screens. Supports pagination. Suitable for native list and filters. |
| GET | `/api/transaction/{id}` | Get one transaction by ID | No | None | `TransactionDto` | Not found in current source | Useful for mobile detail or edit preload. |
| POST | `/api/transaction` | Create transaction | No | `CreateTransactionDto` | `TransactionDto` | `useTransactionMutations` | Suitable. Backend does not validate category-type match in service. |
| PUT | `/api/transaction/{id}` | Update transaction | No | `UpdateTransactionDto` | `TransactionDto` | `useTransactionMutations` | Suitable. Notification recalculation on update is not present. |
| DELETE | `/api/transaction/{id}` | Delete transaction | No | None | `204 No Content` | `useTransactionMutations` | Suitable. Notification recalculation on delete is not present. |
| GET | `/api/transaction/filter/date?date=` | Get transactions for one date | No | None | `TransactionDto[]` | `useTransactionFilter` support exists | Usable, but month endpoint is more efficient for calendar. |
| GET | `/api/transaction/filter/month?year=&month=` | Get all transactions for a month | No | None | `TransactionDto[]` | Calendar page | Good for native calendar and monthly summaries. Could become heavy at scale. |
| GET | `/api/transaction/filter/year?year=` | Get all transactions for a year | No | None | `TransactionDto[]` | Report page via `useTransactionFilter` | Works for analytics. May become large; mobile may prefer aggregate endpoints. |
| GET | `/api/transaction/summary` | Get overall income, expense, balance summary | No | None | `SummaryDto` | `useSummary` | Good reusable summary endpoint. |
| GET | `/api/transaction/summary/month?year=&month=` | Get summary for one month | No | None | `SummaryDto` | Dashboard | Good for mobile dashboard. |
| GET | `/api/transaction/summary/year?year=` | Get summary for one year | No | None | `SummaryDto` | Report page | Good for mobile reports. |
| GET | `/api/transaction/report/yearly?year=` | Get income and expense totals by month for one year | No | None | `MonthlyReportDto[]` | Dashboard and report page | Good for charts and reporting. |

### Categories API

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | Frontend Usage | Notes for Mobile Suitability |
|---|---|---|---|---|---|---|---|
| GET | `/api/category` | Get all categories | No | None | `CategoryDto[]` | Category page | Good for settings or category management. |
| GET | `/api/category/{id}` | Get category by ID | No | None | `CategoryDto` | Not found in current source | Useful but not essential for MVP mobile. |
| GET | `/api/category/type/{type}` | Get categories by income or expense type | No | None | `CategoryDto[]` | Budget page and forms | Highly suitable for mobile pickers and forms. |
| POST | `/api/category` | Create category | No | `CreateCategoryDto` | `CategoryDto` | Category page | Suitable. |
| PUT | `/api/category/{id}` | Update category | No | `UpdateCategoryDto` | `CategoryDto` | Category page | Suitable. |
| DELETE | `/api/category/{id}` | Delete category | No | None | `204 No Content` | Category page | Suitable, subject to business rules and DB constraints. |

### Budget API

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | Frontend Usage | Notes for Mobile Suitability |
|---|---|---|---|---|---|---|---|
| GET | `/api/budget?year=&month=` | Get monthly budget records | No | None | `BudgetDto[]` | `useBudget` | Useful for CRUD records, but overview endpoint is richer. |
| GET | `/api/budget/{id}` | Get budget by ID | No | None | `BudgetDto` | Not found in current source | Optional for detail/edit screens. |
| POST | `/api/budget` | Create budget | No | `CreateBudgetDto` | `BudgetDto` | Budget page | Suitable. Enforces expense-only and uniqueness. |
| PUT | `/api/budget/{id}` | Update budget | No | `UpdateBudgetDto` | `BudgetDto` | Budget page | Suitable. |
| DELETE | `/api/budget/{id}` | Delete budget | No | None | `204 No Content` | Budget page | Suitable. |
| GET | `/api/budget/overview?year=&month=` | Get monthly planned versus spent overview | No | None | `BudgetOverviewDto` with summary and `categories` list of `BudgetStatusDto` | Budget page | Best endpoint for mobile budget overview. |
| GET | `/api/budget/overview/yearly?year=` | Get monthly budget overview for whole year | No | None | `MonthlyBudgetSummaryDto[]` | API client exists, not used in current page | Useful for reporting or planning views. |
| POST | `/api/budget/bulk` | Bulk create or update budget items for one month | No | `BulkUpsertBudgetDto` | Object with `message`, `data` | API client exists, not used in current page | Contract should be treated carefully because frontend typing does not match actual response wrapper. |
| POST | `/api/budget/copy` | Copy budgets from source month to target month | No | `CopyBudgetDto` | Object with `message`, `created`, `skipped`, `overwritten` | Budget page | Suitable for mobile utility flow. |

### Debt API

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | Frontend Usage | Notes for Mobile Suitability |
|---|---|---|---|---|---|---|---|
| GET | `/api/debt` | Get all debt records | No | None | `DebtDto[]` | Debt page | Good for list screens. |
| GET | `/api/debt/{id}` | Get debt by ID | No | None | `DebtDto` | Not found in current source | Useful for mobile detail screen. |
| POST | `/api/debt` | Create debt | No | `CreateDebtDto` | `DebtDto` | Debt page | Suitable. |
| PUT | `/api/debt/{id}` | Update debt | No | `UpdateDebtDto` | `DebtDto` | Debt page | Suitable. |
| DELETE | `/api/debt/{id}` | Delete debt | No | None | `204 No Content` | Debt page | Suitable, with unpaid-only restriction. |
| GET | `/api/debt/type/{type}` | Filter debt by borrowed or lent type | No | None | `DebtDto[]` | API client exists, not used in current page | Useful for segmented native lists. |
| GET | `/api/debt/status/{status}` | Filter debt by status | No | None | `DebtDto[]` | API client exists, not used in current page | Useful for native filters. |
| GET | `/api/debt/overdue` | Get overdue debts | No | None | `DebtDto[]` | API client exists, current page filters locally | Better than local filtering if dataset grows. |
| GET | `/api/debt/summary` | Get aggregate debt summary | No | None | `DebtSummaryDto` | Debt page | Good for cards and overview. |
| GET | `/api/debt/{id}/payments` | Get payment history for one debt | No | None | `DebtPaymentDto[]` | API client exists, not used in current page | Important for proper mobile detail flow. |
| POST | `/api/debt/{id}/payments` | Add a payment to a debt | No | `CreateDebtPaymentDto` | `DebtPaymentDto` | Debt page | Suitable. Business validation is strong. |

### Savings API

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | Frontend Usage | Notes for Mobile Suitability |
|---|---|---|---|---|---|---|---|
| GET | `/api/savings` | Get all savings accounts | No | None | `SavingsAccountDto[]` | Savings page | Good for list screens. |
| GET | `/api/savings/{id}` | Get savings account by ID | No | None | `SavingsAccountDto` | Not found in current source | Useful for native detail screen. |
| POST | `/api/savings` | Create account | No | `CreateSavingsAccountDto` | `SavingsAccountDto` | Savings page | Suitable. |
| PUT | `/api/savings/{id}` | Update account metadata | No | `UpdateSavingsAccountDto` | `SavingsAccountDto` | Savings page | Suitable. |
| DELETE | `/api/savings/{id}` | Delete account | No | None | `204 No Content` | Savings page | Suitable, with value and status restrictions. |
| GET | `/api/savings/type/{type}` | Filter accounts by type | No | None | `SavingsAccountDto[]` | API client exists, not used in current page | Useful for native filters. |
| GET | `/api/savings/status/{status}` | Filter accounts by status | No | None | `SavingsAccountDto[]` | API client exists, not used in current page | Useful for native filters. |
| GET | `/api/savings/maturing?withinDays=` | Get accounts nearing maturity | No | None | `SavingsAccountDto[]` | API client exists, not used in current page | Useful for alerts and dashboards. |
| GET | `/api/savings/summary` | Get savings summary and breakdown by type | No | None | `SavingsSummaryDto` | Savings page | Good for cards and charts. |
| POST | `/api/savings/{id}/deposit` | Add capital to account | No | `SavingsDepositDto` | `SavingsHistoryDto` | Savings page | Suitable. |
| POST | `/api/savings/{id}/withdraw` | Withdraw value from account | No | `SavingsWithdrawDto` | `SavingsHistoryDto` | Savings page | Suitable. |
| POST | `/api/savings/{id}/update-value` | Update current account value | No | `UpdateSavingsValueDto` | `SavingsHistoryDto` | Savings page | Suitable for investment tracking. |
| POST | `/api/savings/{id}/interest` | Add interest record | No | `SavingsInterestDto` | `SavingsHistoryDto` | Savings page | Suitable. |
| GET | `/api/savings/{id}/history` | Get account history | No | None | `SavingsHistoryDto[]` | Savings history dialog | Important for native detail timeline. |
| POST | `/api/savings/{id}/close` | Close account | No | Optional `CloseAccountDto` | `SavingsAccountDto` | Savings page | Good for native action flows. |

### Notifications API

| Method | Path | Purpose | Auth Required | Request Body | Response Shape | Frontend Usage | Notes for Mobile Suitability |
|---|---|---|---|---|---|---|---|
| GET | `/api/notification` | Get all notifications | No | None | `NotificationDto[]` | Notification bell | Works for MVP, but no pagination may be poor for mobile. |
| GET | `/api/notification?onlyUnread=true` | Get unread notifications only | No | None | `NotificationDto[]` | API client support exists | Good for badge sync or inbox filtering. |
| GET | `/api/notification/unread-count` | Get unread count | No | None | `{ count: number }` | API client support exists | Useful for app badge updates. |
| PATCH | `/api/notification/{id}/read` | Mark one notification as read | No | None | `204 No Content` | Notification bell | Suitable. |
| PATCH | `/api/notification/read-all` | Mark all notifications as read | No | None | `204 No Content` | Notification bell | Suitable. |
| DELETE | `/api/notification/{id}` | Delete one notification | No | None | `204 No Content` | API client support exists, not exposed in bell UI | Useful for inbox management. |

## 5. Domain Models

### User
Not found in current source.

Observed absence:
- No user entity
- No identity or profile tables
- No `UserId` on financial domain records
- No auth or session model

### Transaction
Represents a single income or expense record.

Fields from domain and DTOs:
- `Id`
- `Title`
- `Amount`
- `Type`
- `CategoryId`
- `Category`
- `Date`
- `Note`
- `CreatedAt`
- `UpdatedAt`

API response enrichment in `TransactionDto`:
- `CategoryName`
- `CategoryIcon`
- `CategoryColor`
- `TypeName`

Usage:
- Core record for dashboard, list, calendar, report, budget spent calculations, salary notifications

### Category
Represents classification of transactions.

Fields:
- `Id`
- `Name`
- `Icon`
- `Color`
- `Type` as `Income` or `Expense`
- `IsDefault`
- `CreatedAt`
- `UpdatedAt`

Meaning:
- Used by transactions
- Used by budgets
- Seeded defaults include fixed salary category ID

### Budget
Represents monthly planned spending for one expense category.

Fields:
- `Id`
- `CategoryId`
- `Category`
- `Year`
- `Month`
- `PlannedAmount`
- `Note`
- `CreatedAt`
- `UpdatedAt`

Related response models:
- `BudgetDto`
- `BudgetStatusDto`
- `BudgetOverviewDto`
- `MonthlyBudgetSummaryDto`

Meaning:
- Budget records are monthly and category-specific
- Only intended for expense categories
- Overview models combine planned amount with actual spending from transactions

### Debt
Represents a borrowed or lent amount.

Fields:
- `Id`
- `Title`
- `PersonName`
- `OriginalAmount`
- `RemainingAmount`
- `Type`
- `Status`
- `DueDate`
- `Note`
- `CreatedAt`
- `UpdatedAt`

Related models:
- `DebtPayment`
- `DebtPaymentDto`
- `DebtSummaryDto`

Meaning:
- Tracks both liabilities and receivables
- Payment history affects remaining amount and status

### DebtPayment
Represents one repayment or collection event tied to a debt.

Fields:
- `Id`
- `DebtId`
- `Amount`
- `PaidDate`
- `Note`
- `CreatedAt`

### SavingsAccount
Represents a savings or investment account.

Fields:
- `Id`
- `Name`
- `Type`
- `InitialAmount`
- `TotalDeposited`
- `CurrentValue`
- `InterestRate`
- `StartDate`
- `MaturityDate`
- `Status`
- `Note`
- `CreatedAt`
- `UpdatedAt`

Computed meaning in DTO:
- `ProfitLoss`
- `ProfitPercent`
- `IsProfit`
- `IsMatured`
- `DaysToMaturity`
- `StatusName`
- `TypeName`

### SavingsHistory
Represents one financial event on a savings account.

Fields:
- `Id`
- `SavingsAccountId`
- `TransactionType`
- `Amount`
- `PreviousValue`
- `NewValue`
- `ProfitLoss`
- `Note`
- `Date`
- `CreatedAt`

Meaning:
- Tracks deposit, withdrawal, value update, and interest events
- Used for timeline/history view

### Notification
Represents in-app notifications.

Fields:
- `Id`
- `Type`
- `Title`
- `Message`
- `IsRead`
- `DeduplicationKey`
- `CreatedAt`

Types:
- `BudgetAlert`
- `SalaryReceived`
- `WeeklySummary`

### Report models
There is no standalone persisted `Report` entity.

Report-related DTOs exist:
- `SummaryDto`
- `MonthlyReportDto`
- `BudgetOverviewDto`
- `MonthlyBudgetSummaryDto`
- `DebtSummaryDto`
- `SavingsSummaryDto`

Meaning:
- Reporting is computed from transactional data, not stored as snapshots

## 6. Business Rules

### Transaction rules
- Transaction creation requires title, positive amount, type, category, and date
- Pagination requires `page >= 1`
- Page size must be between `1` and `100`
- `fromDate` must not be later than `toDate`
- Expense transaction creation triggers budget alert checks
- Income transaction creation with salary category triggers salary notification
- Not found in current source: service-level validation that transaction type matches category type
- Not found in current source: rules preventing deleting transactions that affect budget or reports
- Not found in current source: notification recalculation on transaction update or delete

### Category rules
- Category name is required
- Category type is required
- Default categories cannot be deleted
- Category delete may still fail at database layer if referenced by transactions due to transaction foreign key restrict behavior
- Budget module expects only expense categories to be budgetable
- Seeded categories include multiple default income and expense categories

### Budget rules
- Budget can only be created for an expense category
- Only one budget is allowed per category per month
- Month must be in range `1..12`
- Planned amount must be greater than or equal to minimum annotated value
- Budget overview includes:
  - over-budget
  - near-limit
  - on-track
  - no-budget-but-has-spending states
- Copying budget from month A to month B cannot use same source and target month
- Copy fails if source month has no budgets
- Copy can skip or overwrite target records depending on request

### Debt rules
- New debt starts with `remainingAmount = originalAmount`
- New debt starts with `status = Unpaid`
- Payment amount must be positive
- Payment cannot exceed remaining amount
- Fully paid debt cannot receive further payments
- Debt status becomes:
  - `Paid` if remaining amount reaches zero
  - `PartiallyPaid` otherwise
- Only debts with status `Unpaid` may be deleted
- Overdue debt is defined as:
  - `DueDate < now`
  - status is not `Paid`

### Savings rules
- New account starts as `Active`
- New account sets:
  - `TotalDeposited = InitialAmount`
  - `CurrentValue = InitialAmount`
- New account creation automatically writes one initial history record
- Closed accounts cannot be updated
- Closed accounts cannot receive transactions
- Withdrawal amount cannot exceed current value
- Active accounts with positive current value cannot be deleted
- Close operation marks account as `Closed`
- Not found in current source: automatic transition from `Active` to `Matured`

### Notification rules
- Budget alert milestones are `50%`, `80%`, `100%`
- Budget alerts are deduplicated by `categoryId + year + month + milestone`
- Salary received notifications are created only for income transactions using the fixed salary category GUID
- Salary notifications are not deduplicated
- Weekly summary notifications are deduplicated by ISO week
- Weekly summary compares this week expense with previous week expense
- Notification bell UI polls every 60 seconds on web

### Reporting rules
- Transaction summaries are computed by aggregating income and expense amounts
- Yearly report loops through months `1..12` and computes income and expense totals for each month
- Budget overview spending is derived only from expense transactions
- Savings summary excludes closed accounts from total deposited and current value aggregates
- Debt summary separates borrowed and lent totals and remaining values

### User scope rules
Not found in current source.

Observed impact:
- No per-user ownership checks
- No tenant isolation
- All queries are global to the database contents

## 7. Mobile App Feature Mapping

### Mapping from web features to mobile features

| Web Feature | Suggested Mobile Feature |
|---|---|
| Dashboard monthly summary | Home dashboard with monthly summary cards |
| Monthly bar chart | Home chart or reports chart |
| Recent transactions | Home recent activity list |
| Transaction list and filters | Transactions tab with filters sheet |
| Transaction create/edit dialog | Native create/edit flow or sheet |
| Calendar monthly view | Calendar screen under transactions |
| Daily transactions panel | Day detail screen |
| Yearly report page | Reports screen |
| Category breakdown | Reports charts or breakdown list |
| Budget overview page | Budget tab or planning section |
| Budget create/edit/delete | Budget management flow |
| Budget copy month | Utility action in budget settings |
| Debt page | Debt list plus debt detail and payment flow |
| Savings page | Savings/accounts tab plus account detail |
| Notification bell dropdown | Notifications inbox screen |
| Category page | Categories management under settings or a dedicated screen |

### Features that should remain in mobile MVP
Recommended mobile MVP features based on current source maturity and backend readiness:
- Dashboard summary
- Transaction list
- Transaction create, edit, delete
- Transaction calendar
- Categories retrieval and category selection in forms
- Budget monthly overview
- Debt list and payment flow
- Savings list and account operations
- Notification inbox
- Basic reports using existing summary and yearly report endpoints

These features have direct backend support and clear web parity.

### Features that can be deferred in early mobile release
- Budget yearly overview UI
- Bulk budget upsert UI
- Advanced category management UX beyond CRUD
- Full debt payment history UI if detail depth is limited in MVP
- Savings type-specific analytics beyond summary
- Theme switching
- Desktop-like multi-panel layouts
- Aggressive notification polling behavior

### Recommended mobile flows

#### Home flow
- Open app
- Load monthly summary
- Show recent transactions
- Show lightweight chart
- Show unread notification count

#### Transaction flow
- Browse transactions list
- Filter by type and date range
- Open transaction detail or edit
- Create transaction from primary action
- Jump into calendar for date-based navigation

#### Budget flow
- Open current month budget overview
- View categories near limit or over budget
- Create or edit budget for category
- Copy from previous month when needed

#### Debt flow
- View summary of borrowed, lent, overdue
- Switch between borrowed and lent segments
- Open debt detail
- Add repayment or collection

#### Savings flow
- View account list and current value summary
- Open account detail and history
- Perform deposit, withdraw, update value, or add interest
- Close account when needed

#### Notifications flow
- View inbox
- Mark notifications as read
- Navigate conceptually from notification to relevant feature

Assumption: Deep linking from notifications to relevant feature is desirable for mobile, but not implemented in current source.

## 8. Gaps For Mobile

### Missing endpoints for mobile
The backend is usable for a native app, but several gaps are visible.

#### Authentication and session endpoints
Not found in current source:
- Login
- Logout
- Refresh token
- User profile
- Session validation

This is the largest mobile gap if the app is intended for anything beyond single-user or private use.

#### Device and push endpoints
Not found in current source:
- Register device token
- Remove device token
- Push notification delivery coordination

#### Aggregated mobile-friendly endpoints
Current source is strongly endpoint-by-domain and sometimes list-heavy.
Potential missing endpoints for mobile convenience:
- Combined home dashboard payload
- Combined debt detail plus payment history
- Combined savings detail plus recent history
- Paginated notifications endpoint

Assumption: Mobile would benefit from fewer round trips, especially on constrained networks.

### Responses not optimized for mobile
- Notifications return full list with no pagination
- Yearly transaction filter returns entire year of transactions rather than only aggregates
- Month transactions endpoint returns all transactions for calendar month, which may be heavy at scale
- Budget bulk endpoint returns anonymous wrapper object while web API client typing suggests plain array; contract clarity is weak
- Several modules require multiple requests to build a complete screen:
  - savings summary plus account list plus account history
  - debt summary plus debt list plus payment history

### Auth and session issues
- No auth
- No token storage model
- No user-bound data
- No access control
- No request identity in controllers
- No secure session lifecycle

Impact on mobile:
- Cannot safely support signed-in personal finance use cases
- Cannot support multiple users against same backend instance
- Cannot support app-store-grade production expectations without backend changes

### Web-centric aspects in current source
- Notification UX is dropdown-based rather than inbox- or push-oriented
- Layout assumes sidebar and top bar shell
- Some pages rely on modal dialogs for editing rather than dedicated detail or edit flows
- Theme toggle is included as app chrome feature but is not core domain functionality
- Local refetch-after-mutation model maps well to web but native apps usually benefit from screen-level repositories and cache orchestration
- Calendar page derives daily state from one month fetch, which is fine for web but may need optimized native view models

### Data modeling gap for mobile production
- No `User` model
- No ownership field on domain records
- No audit metadata beyond timestamps
- No sync metadata
- No soft-delete strategy
- No conflict resolution model

## 9. Recommendations

### What should remain unchanged
- Keep the backend domain decomposition by module:
  - transactions
  - categories
  - budgets
  - debts
  - savings
  - notifications
- Keep the existing business logic in services where rules are already explicit and stable
- Keep the DTO-driven API style because it maps cleanly to mobile models
- Keep the layered backend architecture because it is understandable and reusable

### Backend additions recommended before or during mobile adoption
- Add authentication and authorization if the product is intended for any multi-user or public scenario
- Add explicit user ownership to all persisted financial entities
- Add consistent API response contracts for endpoints returning wrapped data
- Add validation ensuring transaction type matches selected category type
- Add notification recalculation or reconciliation behavior for transaction update and delete
- Add clarity around savings maturity lifecycle if `Matured` status is intended to matter in mobile UX
- Add pagination or cursoring for notifications
- Consider adding a combined dashboard endpoint for mobile home screen efficiency

### Architecture direction recommended for mobile
- Build mobile around the same domain modules as backend
- Treat the backend as source of truth for business rules
- Use native flows that separate:
  - list
  - detail
  - create and edit
  - action sheet or confirmation
- Prefer a domain-based API layer rather than screen-based API layer
- Preserve report and summary calculations on the server, not on-device, where equivalent endpoints already exist

### Product direction recommendations from current source
- Position current backend as suitable for:
  - private single-user deployment
  - internal prototype
  - MVP mobile client
- Do not assume current source is production-ready for:
  - authenticated consumer deployment
  - shared-user environment
  - secure App Store release with cloud sync
- Use current source as the authoritative financial domain baseline, not as a complete mobile backend platform

### Documentation recommendation
- Mobile implementation should treat current DTOs and service rules as baseline contracts
- Any inferred behavior not explicitly enforced in backend should not be treated as guaranteed system behavior

## 10. Assumptions And Unknowns

### Assumptions
- Assumption: The product is intended for a single end user because there is no user model, no auth, and all records are globally scoped.
- Assumption: The seeded category with fixed GUID `10000000-0000-0000-0000-000000000001` represents salary and is business-critical because notifications depend on it.
- Assumption: Form components not fully inspected at field level follow the backend DTO contract and primarily rely on backend validation.
- Assumption: Mobile should preserve backend-owned business logic rather than reimplement financial rules locally.
- Assumption: Reports are meant to be computed dynamically rather than stored as persisted snapshots because no report entity exists.

### Unknowns
- Not found in current source: explicit product requirements document
- Not found in current source: user personas or target market definition
- Not found in current source: authentication or user registration flow
- Not found in current source: password reset, email verification, social login
- Not found in current source: push notification delivery mechanism
- Not found in current source: analytics, telemetry, or crash reporting
- Not found in current source: export, import, sync, or backup features
- Not found in current source: tests or test projects
- Not found in current source: API versioning strategy
- Not found in current source: rate limiting, throttling, or abuse protection
- Not found in current source: background jobs beyond weekly summary
- Not found in current source: automatic overdue debt notification generation
- Not found in current source: automatic maturity update job for savings accounts
- Not found in current source: explicit mobile requirements
- Not found in current source: accessibility requirements
- Not found in current source: localization strategy beyond Vietnamese labels embedded in source
- Not found in current source: offline support strategy

### Source inconsistencies or contract risks
- `budgetApi.bulkUpsert` in frontend expects `BudgetRecord[]`, while backend controller returns an object with `message` and `data`
- Notification service comments imply triggers after create, update, and delete of transactions, but current implementation triggers only after create
- Savings enum includes `Matured`, but no discovered service or job automatically moves accounts into that status
- Category deletion is guarded for default categories at service level, but referenced non-default categories may also fail deletion because of transaction foreign key restrictions

### Final state of source truth confidence
- High confidence:
  - implemented modules
  - route inventory
  - data model existence
  - absence of authentication
  - presence of layered backend structure
  - core web screens
- Medium confidence:
  - fine-grained frontend form validation inside form components not fully enumerated here
  - intended product direction beyond current single-user behavior
- Low confidence:
  - any production readiness assumptions beyond what is explicitly present in source
