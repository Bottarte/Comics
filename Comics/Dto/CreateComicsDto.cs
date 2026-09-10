namespace Comics.Dto
{
    public record CreateComicsDto(
        string Title,
        DateOnly ReleaseDate,
        int Pages,
        List<int> TypeIds,
        List<int> GenreIds,
        List<CreateComicsDetailsDto>? Details
    );
}