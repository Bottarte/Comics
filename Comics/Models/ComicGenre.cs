namespace Comics.Models
{
    public class ComicGenre
    {
        public int ComicId { get; set; }
        public Comic Comic { get; set; } = null!;

        public int GenresId { get; set; }
        public Genre Genre { get; set; } = null!;
        public DateTime TimeAssigmant { get; set; }
    }
}
