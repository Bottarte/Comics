using Comics.Data;
using Comics.Dto;
using Microsoft.EntityFrameworkCore;

namespace Comics.Endpoint
{
    public class ReportEndpoints
    {
        public static async Task<IResult> GetFirstReport(ComicsDbContext db)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var rawData = await db.Comics
                .Select(c => new
                {
                    TypeName = c.Types.Select(t => t.Name).FirstOrDefault() ?? "Без типу",
                    c.Title,
                    Quantity = c.Details.Sum(d => (int?)d.Quantity) ?? 0,
                    TotalSum = c.Details.Sum(d => (decimal?)(d.Quantity * d.Price)) ?? 0m
                })
                .ToListAsync();

            var report = rawData
                .GroupBy(c => c.TypeName)
                .Select(g => new TypeGroupReportDto(
                    g.Key,
                    g.Select(item => new ComicReportItemDto(
                        item.Title,
                        today,
                        item.Quantity,
                        item.TotalSum
                    )).ToList()
                ))
                .ToList();

            return Results.Ok(report);
        }

        const string path = "api/report";

        public static void MapReportsEndpoints(WebApplication app)
        {
            var group = app.MapGroup(path);
            group.MapGet("", GetFirstReport);
        }
    }
}