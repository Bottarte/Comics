namespace Comics.Dto;

public record ComicReportItemDto(
    string Title,
    DateOnly Date,
    int Quantity,
    decimal TotalSum
);