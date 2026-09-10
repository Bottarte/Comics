namespace Comics.Models
{
    public class Genre
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<ComicGenre> ComicGenres { get; set; } = new List<ComicGenre>();
    }
}
