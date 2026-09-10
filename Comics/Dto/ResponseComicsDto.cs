using Comics.Models;

namespace Comics.Dto
{
    public record ResponseComicsDto(
        int Id,
        string Title,
        DateOnly ReleaseDate,
        int Pages,
        List<ResponseComicGenreDto> ComicGenre,
        List<string> Types,
        List<ResponseComicsDetailsDto> Details
    );
}