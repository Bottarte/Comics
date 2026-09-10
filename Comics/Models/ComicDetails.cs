using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Comics.Models
{
    public class ComicDetails
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public int? ShopId { get; set; }
        public Shop? Shop { get; set; } = null!;
        public int ComicId { get; set; }
        public Comic Comic { get; set; } = null!;
    }
}