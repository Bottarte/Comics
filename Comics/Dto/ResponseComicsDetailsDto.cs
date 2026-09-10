namespace Comics.Dto
{
    public record ResponseComicsDetailsDto(
        int Id,
        decimal? Price,
        int? Quantity,
        int? ShopId,
        string? ShopName
    );
}