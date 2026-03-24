using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;

namespace Microsoft.EntityFrameworkCore;

public static class SqlServerCompatibilityDbContextOptionsExtensions
{
    public static DbContextOptionsBuilder UseSqlServer(
        this DbContextOptionsBuilder optionsBuilder,
        string? connectionString,
        Action<SqlServerCompatibilityOptionsBuilder>? sqlServerOptionsAction = null)
    {
        return optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
        {
            var compatibilityOptions = new SqlServerCompatibilityOptionsBuilder(npgsqlOptions);
            sqlServerOptionsAction?.Invoke(compatibilityOptions);
        });
    }

    public static DbContextOptionsBuilder<TContext> UseSqlServer<TContext>(
        this DbContextOptionsBuilder<TContext> optionsBuilder,
        string? connectionString,
        Action<SqlServerCompatibilityOptionsBuilder>? sqlServerOptionsAction = null)
        where TContext : DbContext
    {
        UseSqlServer((DbContextOptionsBuilder)optionsBuilder, connectionString, sqlServerOptionsAction);
        return optionsBuilder;
    }
}

public sealed class SqlServerCompatibilityOptionsBuilder
{
    private readonly NpgsqlDbContextOptionsBuilder _npgsqlOptionsBuilder;

    public SqlServerCompatibilityOptionsBuilder(NpgsqlDbContextOptionsBuilder npgsqlOptionsBuilder)
    {
        _npgsqlOptionsBuilder = npgsqlOptionsBuilder;
    }

    public SqlServerCompatibilityOptionsBuilder EnableRetryOnFailure(
        int maxRetryCount,
        TimeSpan maxRetryDelay,
        IEnumerable<int>? errorNumbersToAdd = null)
    {
        var postgresErrorCodes = errorNumbersToAdd?.Select(e => e.ToString()).ToList();
        _npgsqlOptionsBuilder.EnableRetryOnFailure(maxRetryCount, maxRetryDelay, postgresErrorCodes);
        return this;
    }
}
