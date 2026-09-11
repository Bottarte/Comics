using Comics.Data;
using Comics.Models;
using Microsoft.EntityFrameworkCore;

namespace Comics.Endpoint
{
    public class ActionEndpoints
    {
        public static async Task<IResult> Bestseller(ComicsDbContext db, int minPages = 0)
        {
            bool hasComicsWithDetails = await db.Comics.AnyAsync(c => c.Details.Any());

            if (!hasComicsWithDetails)
            {
                return Results.Ok(new { message = "Немає коміксів із деталями для обробки." });
            }

            var bestsellerGenre = await db.Genres.FirstOrDefaultAsync(g => g.Name == "Bestseller");

            if (bestsellerGenre is null)
            {
                return Results.BadRequest(new { message = "Жанр 'Bestseller' не знайдено" });
            }

            await using var transaction = await db.Database.BeginTransactionAsync();

            try
            {
                var comics = await db.Comics
                    .Include(c => c.Details)
                    .Include(c => c.ComicGenres)
                        .ThenInclude(cg => cg.Genre)
                    .Where(c => c.Details.Any())
                    .ToListAsync();

                foreach (var comic in comics)
                {
                    var groupedDetails = comic.Details
                        .GroupBy(d => d.ShopId)
                        .Where(g => g.Count() > 1)
                        .ToList();

                    foreach (var group in groupedDetails)
                    {
                        var primaryDetail = group.First();

                        primaryDetail.Price = group.Max(d => d.Price);
                        primaryDetail.Quantity = (int)Math.Round(group.Average(d => d.Quantity) ?? 0);

                        var duplicates = group.Skip(1).ToList();
                        foreach (var duplicate in duplicates)
                        {
                            comic.Details.Remove(duplicate);
                            db.ComicDetails.Remove(duplicate);
                        }
                    }

                    var existBestseller = comic.ComicGenres
                        .FirstOrDefault(cg => cg.Genre.Name == "Bestseller");

                    if (comic.Pages < minPages)
                    {
                        if (existBestseller is not null)
                        {
                            comic.ComicGenres.Remove(existBestseller);
                            db.ComicGenres.Remove(existBestseller);
                        }
                    }
                    else
                    {
                        if (existBestseller is not null)
                        {
                            existBestseller.TimeAssigmant = DateTime.UtcNow;
                        }
                        else
                        {
                            comic.ComicGenres.Add(new ComicGenre
                            {
                                ComicId = comic.Id,
                                GenresId = bestsellerGenre.Id,
                                TimeAssigmant = DateTime.UtcNow
                            });
                        }
                    }
                }

                await db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Results.Ok(new { message = $"Бестселери оновлено (мінімум сторінок: {minPages})." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

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