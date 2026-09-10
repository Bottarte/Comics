using Comics.Data;
using Comics.Dto;
using Comics.Models;
using Microsoft.EntityFrameworkCore;

namespace Comics.Endpoint
{
    public class ComicsEndpoints
    {
        const string BasePath = "/api/comics";

        public static async Task<IResult> GetComics(ComicsDbContext db)
        {
            var comics = await db.Comics
                .AsNoTracking()
                .Select(c => new ResponseComicsDto(
                    c.Id,
                    c.Title,
                    c.ReleaseDate,
                    c.Pages,
                    c.ComicGenres.Select(cg => new ResponseComicGenreDto(
                        cg.Genre.Name,
                        cg.TimeAssigmant
                    )).ToList(),
                    c.Types.Select(t => t.Name).ToList(),
                    c.Details.Select(d => new ResponseComicsDetailsDto(
                        d.Id,
                        d.Price,
                        d.Quantity,
                        d.ShopId,
                        d.Shop != null ? d.Shop.Name : null
                    )).ToList()
                ))
                .ToListAsync();

            return Results.Ok(comics);
        }

        public static async Task<IResult> GetComicById(int id, ComicsDbContext db)
        {
            var comic = await db.Comics
                .AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new ResponseComicsDto(
                    c.Id,
                    c.Title,
                    c.ReleaseDate,
                    c.Pages,
                    c.ComicGenres.Select(cg => new ResponseComicGenreDto(
                        cg.Genre.Name,
                        cg.TimeAssigmant
                    )).ToList(),
                    c.Types.Select(t => t.Name).ToList(),
                    c.Details.Select(d => new ResponseComicsDetailsDto(
                        d.Id,
                        d.Price,
                        d.Quantity,
                        d.ShopId,
                        d.Shop != null ? d.Shop.Name : null
                    )).ToList()
                ))
                .FirstOrDefaultAsync();

            if (comic == null)
            {
                return Results.NotFound();
            }
            return Results.Ok(comic);
        }

        public static async Task<IResult> CreateComic(ComicsDbContext db, CreateComicsDto request)
        {
            if (request.TypeIds == null || !request.TypeIds.Any())
            {
                return Results.BadRequest("TypeIds are required and cannot be empty.");
            }

            var typeIds = request.TypeIds.Distinct().ToList();
            var types = await db.Types.Where(t => typeIds.Contains(t.Id)).ToListAsync();
            if (types.Count != typeIds.Count)
            {
                return Results.BadRequest("One or more specified Type IDs do not exist.");
            }

            var genreIds = (request.GenreIds ?? new List<int>()).Distinct().ToList();
            var existingGenreCount = genreIds.Any()
                ? await db.Genres.CountAsync(g => genreIds.Contains(g.Id))
                : 0;

            if (existingGenreCount != genreIds.Count)
            {
                return Results.BadRequest("One or more specified Genre IDs do not exist.");
            }

            var safeDetails = request.Details ?? new List<CreateComicsDetailsDto>();

            var shopIds = safeDetails
                .Where(d => d.ShopId.HasValue && d.ShopId.Value > 0)
                .Select(d => d.ShopId!.Value)
                .Distinct()
                .ToList();

            if (shopIds.Any())
            {
                var existingShopCount = await db.Shops.CountAsync(s => shopIds.Contains(s.Id));
                if (existingShopCount != shopIds.Count)
                {
                    return Results.BadRequest("One or more specified Shop IDs do not exist.");
                }
            }

            var comicDetailsList = safeDetails.Select(d => new ComicDetails
            {
                Price = d.Price ?? 0m,
                Quantity = d.Quantity ?? 0,
                ShopId = (d.ShopId.HasValue && d.ShopId.Value > 0) ? d.ShopId : null
            }).ToList();

            var comicGenresList = genreIds.Select(gId => new ComicGenre
            {
                GenresId = gId,
                TimeAssigmant = DateTime.UtcNow
            }).ToList();

            var comic = new Comic
            {
                Title = request.Title,
                ReleaseDate = request.ReleaseDate,
                Pages = request.Pages,
                Types = types,
                ComicGenres = comicGenresList,
                Details = comicDetailsList
            };

            db.Comics.Add(comic);
            await db.SaveChangesAsync();

            var createdComic = await db.Comics
                .AsNoTracking()
                .Where(c => c.Id == comic.Id)
                .Select(c => new ResponseComicsDto(
                    c.Id,
                    c.Title,
                    c.ReleaseDate,
                    c.Pages,
                    c.ComicGenres.Select(cg => new ResponseComicGenreDto(
                        cg.Genre.Name,
                        cg.TimeAssigmant
                    )).ToList(),
                    c.Types.Select(t => t.Name).ToList(),
                    c.Details.Select(d => new ResponseComicsDetailsDto(
                        d.Id,
                        d.Price,
                        d.Quantity,
                        d.ShopId,
                        d.Shop != null ? d.Shop.Name : null
                    )).ToList()
                ))
                .FirstAsync();

            return Results.Created($"/api/comics/{comic.Id}", createdComic);
        }

        public static async Task<IResult> UpdateComic(ComicsDbContext db, int id, CreateComicsDto request)
        {
            var comic = await db.Comics
                .Include(c => c.Details)
                .Include(c => c.ComicGenres)
                .Include(c => c.Types)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comic == null)
            {
                return Results.NotFound($"Comic with ID {id} not found.");
            }

            if (request.TypeIds == null || !request.TypeIds.Any())
            {
                return Results.BadRequest("TypeIds are required and cannot be empty.");
            }

            var typeIds = request.TypeIds.Distinct().ToList();
            var types = await db.Types.Where(t => typeIds.Contains(t.Id)).ToListAsync();
            if (types.Count != typeIds.Count)
            {
                return Results.BadRequest("One or more specified Type IDs do not exist.");
            }

            var genreIds = (request.GenreIds ?? new List<int>()).Distinct().ToList();
            var existingGenreCount = genreIds.Any()
                ? await db.Genres.CountAsync(g => genreIds.Contains(g.Id))
                : 0;

            if (existingGenreCount != genreIds.Count)
            {
                return Results.BadRequest("One or more specified Genre IDs do not exist.");
            }

            var safeDetails = request.Details ?? new List<CreateComicsDetailsDto>();

            var shopIds = safeDetails
                .Where(d => d.ShopId.HasValue && d.ShopId.Value > 0)
                .Select(d => d.ShopId!.Value)
                .Distinct()
                .ToList();

            if (shopIds.Any())
            {
                var existingShopCount = await db.Shops.CountAsync(s => shopIds.Contains(s.Id));
                if (existingShopCount != shopIds.Count)
                {
                    return Results.BadRequest("One or more specified Shop IDs do not exist.");
                }
            }

            comic.Title = request.Title;
            comic.ReleaseDate = request.ReleaseDate;
            comic.Pages = request.Pages;

            comic.Types.Clear();
            foreach (var type in types)
            {
                comic.Types.Add(type);
            }
            var currentGenreIds = comic.ComicGenres.Select(cg => cg.GenresId).ToList();

            var toRemove = comic.ComicGenres.Where(cg => !genreIds.Contains(cg.GenresId)).ToList();
            foreach (var item in toRemove)
            {
                db.ComicGenres.Remove(item);
            }


            var newGenreIds = genreIds.Except(currentGenreIds).ToList();
            foreach (var newGenreId in newGenreIds)
            {
                comic.ComicGenres.Add(new ComicGenre
                {
                    ComicId = comic.Id,
                    GenresId = newGenreId,
                    TimeAssigmant = DateTime.UtcNow 
                });
            }

            db.ComicDetails.RemoveRange(comic.Details);
            comic.Details.Clear();

            foreach (var detailDto in safeDetails)
            {
                comic.Details.Add(new ComicDetails
                {
                    Price = detailDto.Price ?? 0m,
                    Quantity = detailDto.Quantity ?? 0,
                    ShopId = (detailDto.ShopId.HasValue && detailDto.ShopId.Value > 0) ? detailDto.ShopId : null
                });
            }

            await db.SaveChangesAsync();

            return Results.NoContent();
        }

        public static async Task<IResult> DeleteComic(ComicsDbContext db, int id)
        {
            var comic = await db.Comics.FindAsync(id);
            if (comic == null)
            {
                return Results.NotFound();
            }

            db.Comics.Remove(comic);
            await db.SaveChangesAsync();

            return Results.NoContent();
        }

        public static async Task<IResult> GetShops(ComicsDbContext db)
        {
            var shops = await db.Shops
                .AsNoTracking()
                .Select(s => new { s.Id, s.Name })
                .ToListAsync();

            return Results.Ok(shops);
        }

        public static async Task<IResult> GetGenres(ComicsDbContext db)
        {
            var genres = await db.Genres
                .AsNoTracking()
                .Select(g => new { g.Id, g.Name })
                .ToListAsync();

            return Results.Ok(genres);
        }

        public static async Task<IResult> GetTypes(ComicsDbContext db)
        {
            var types = await db.Types
                .AsNoTracking()
                .Select(t => new { t.Id, t.Name })
                .ToListAsync();

            return Results.Ok(types);
        }

        public static void MapComicsEndpoints(WebApplication app)
        {
            var group = app.MapGroup(BasePath);
            group.MapGet("/", GetComics);
            group.MapGet("/{id}", GetComicById);
            group.MapPost("/", CreateComic);
            group.MapDelete("/{id}", DeleteComic);
            group.MapPut("/{id}", UpdateComic);
            app.MapGet("/api/shops", GetShops);
            app.MapGet("/api/genres", GetGenres);
            app.MapGet("/api/types", GetTypes);
        }
    }
}