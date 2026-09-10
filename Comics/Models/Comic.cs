using Comics.Models;

namespace Comics.Models
{
    public class Comic
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateOnly ReleaseDate { get; set; }
        public int Pages { get; set; }
        public List<ComicDetails> Details { get; set; } = new List<ComicDetails>();
        public List<ComicType> Types { get; set; } = new List<ComicType>();
        public ICollection<ComicGenre> ComicGenres { get; set; } = new List<ComicGenre>();
    }
}