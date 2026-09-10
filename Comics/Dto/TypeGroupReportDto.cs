namespace Comics.Dto
{
    public record TypeGroupReportDto(
    string TypeName,
    List<ComicReportItemDto> Items
    );
}
