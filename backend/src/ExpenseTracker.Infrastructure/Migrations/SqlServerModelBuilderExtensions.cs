namespace Microsoft.EntityFrameworkCore;

public static class SqlServerModelBuilderExtensions
{
    public static ModelBuilder UseIdentityColumns(this ModelBuilder modelBuilder)
    {
        return modelBuilder;
    }
}
