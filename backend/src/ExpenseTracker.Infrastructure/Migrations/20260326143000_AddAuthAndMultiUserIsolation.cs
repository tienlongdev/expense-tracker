using System;
using ExpenseTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseTracker.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260326143000_AddAuthAndMultiUserIsolation")]
public class AddAuthAndMultiUserIsolation : Migration
{
    private static readonly Guid DemoUserId = new("11111111-1111-1111-1111-111111111111");

    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                FullName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                PreferredCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                TimeZone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_User_Email",
            table: "Users",
            column: "Email",
            unique: true);

        migrationBuilder.InsertData(
            table: "Users",
            columns: new[] { "Id", "Email", "PasswordHash", "FullName", "PreferredCurrency", "TimeZone", "CreatedAt" },
            values: new object[]
            {
                DemoUserId,
                "demo@expense-tracker.local",
                "100000.AAECAwQFBgcICQoLDA0ODw==.+vNKwK5cNpJPHFXipa2pv57Dy1Hb2y1LAkpuOy94G5I=",
                "Demo User",
                "VND",
                "Asia/Saigon",
                DateTime.UtcNow
            });

        AddUserIdColumn(migrationBuilder, "Categories");
        AddUserIdColumn(migrationBuilder, "Transactions");
        AddUserIdColumn(migrationBuilder, "Debts");
        AddUserIdColumn(migrationBuilder, "DebtPayments");
        AddUserIdColumn(migrationBuilder, "SavingsAccounts");
        AddUserIdColumn(migrationBuilder, "SavingsHistories");
        AddUserIdColumn(migrationBuilder, "Budgets");
        AddUserIdColumn(migrationBuilder, "Notifications");

        migrationBuilder.DropIndex(
            name: "IX_Budget_Category_YearMonth",
            table: "Budgets");

        migrationBuilder.CreateIndex(
            name: "IX_Budget_User_Category_YearMonth",
            table: "Budgets",
            columns: new[] { "UserId", "CategoryId", "Year", "Month" },
            unique: true);

        migrationBuilder.DropIndex(
            name: "IX_Notification_DeduplicationKey",
            table: "Notifications");

        migrationBuilder.CreateIndex(
            name: "IX_Notification_User_DeduplicationKey",
            table: "Notifications",
            columns: new[] { "UserId", "DeduplicationKey" });

        AddUserForeignKey(migrationBuilder, "Categories");
        AddUserForeignKey(migrationBuilder, "Transactions");
        AddUserForeignKey(migrationBuilder, "Debts");
        AddUserForeignKey(migrationBuilder, "DebtPayments");
        AddUserForeignKey(migrationBuilder, "SavingsAccounts");
        AddUserForeignKey(migrationBuilder, "SavingsHistories");
        AddUserForeignKey(migrationBuilder, "Budgets");
        AddUserForeignKey(migrationBuilder, "Notifications");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        DropUserForeignKey(migrationBuilder, "Notifications");
        DropUserForeignKey(migrationBuilder, "Budgets");
        DropUserForeignKey(migrationBuilder, "SavingsHistories");
        DropUserForeignKey(migrationBuilder, "SavingsAccounts");
        DropUserForeignKey(migrationBuilder, "DebtPayments");
        DropUserForeignKey(migrationBuilder, "Debts");
        DropUserForeignKey(migrationBuilder, "Transactions");
        DropUserForeignKey(migrationBuilder, "Categories");

        migrationBuilder.DropIndex(name: "IX_Budget_User_Category_YearMonth", table: "Budgets");
        migrationBuilder.CreateIndex(
            name: "IX_Budget_Category_YearMonth",
            table: "Budgets",
            columns: new[] { "CategoryId", "Year", "Month" },
            unique: true);

        migrationBuilder.DropIndex(name: "IX_Notification_User_DeduplicationKey", table: "Notifications");
        migrationBuilder.CreateIndex(
            name: "IX_Notification_DeduplicationKey",
            table: "Notifications",
            column: "DeduplicationKey");

        DropUserIdColumn(migrationBuilder, "Notifications");
        DropUserIdColumn(migrationBuilder, "Budgets");
        DropUserIdColumn(migrationBuilder, "SavingsHistories");
        DropUserIdColumn(migrationBuilder, "SavingsAccounts");
        DropUserIdColumn(migrationBuilder, "DebtPayments");
        DropUserIdColumn(migrationBuilder, "Debts");
        DropUserIdColumn(migrationBuilder, "Transactions");
        DropUserIdColumn(migrationBuilder, "Categories");

        migrationBuilder.DropTable(name: "Users");
    }

    private static void AddUserIdColumn(MigrationBuilder migrationBuilder, string tableName)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "UserId",
            table: tableName,
            type: "uuid",
            nullable: false,
            defaultValue: DemoUserId);

        migrationBuilder.CreateIndex(
            name: $"IX_{tableName}_UserId",
            table: tableName,
            column: "UserId");
    }

    private static void DropUserIdColumn(MigrationBuilder migrationBuilder, string tableName)
    {
        migrationBuilder.DropIndex(name: $"IX_{tableName}_UserId", table: tableName);
        migrationBuilder.DropColumn(name: "UserId", table: tableName);
    }

    private static void AddUserForeignKey(MigrationBuilder migrationBuilder, string tableName)
    {
        migrationBuilder.AddForeignKey(
            name: $"FK_{tableName}_Users_UserId",
            table: tableName,
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    private static void DropUserForeignKey(MigrationBuilder migrationBuilder, string tableName)
    {
        migrationBuilder.DropForeignKey(
            name: $"FK_{tableName}_Users_UserId",
            table: tableName);
    }
}
