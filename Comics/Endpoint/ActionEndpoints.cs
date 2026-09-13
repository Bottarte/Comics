using Comics.Data;
using Microsoft.EntityFrameworkCore;

namespace Comics.Endpoint
{
    public class ActionEndpoints
    {
        public static async Task<IResult> Bestseller(ComicsDbContext db, int minPages = 0)
        {
            try
            {
                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    EXEC ExecuteBestsellerLogic @MinPages = {minPages}
                ");

                return Results.Ok(new { message = $"Бестселери оновлено (мінімум сторінок: {minPages})." });
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError
                );
            }
        }

        const string path = "/api/action";
        public static void MapActionEndpoints(WebApplication app)
        {
            var group = app.MapGroup(path);
            group.MapPut("/bestseller", Bestseller);
        }
    }
}