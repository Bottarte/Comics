using Comics.Models;
using Microsoft.EntityFrameworkCore;

namespace Comics.Data
{
    public class ComicsDbContext : DbContext
    {
        public ComicsDbContext(DbContextOptions<ComicsDbContext> options) : base(options)
        {
        }

        public DbSet<ComicGenre> ComicGenres { get; set; }
        public DbSet<Comic> Comics { get; set; }
        public DbSet<ComicDetails> ComicDetails { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<ComicType> Types { get; set; }
        public DbSet<Shop> Shops { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ComicGenre>()
                .HasKey(cg => new { cg.ComicId, cg.GenresId });

            modelBuilder.Entity<ComicGenre>()
                .HasOne(cg => cg.Comic)
                .WithMany(c => c.ComicGenres)
                .HasForeignKey(cg => cg.ComicId);

            modelBuilder.Entity<ComicGenre>()
                .HasOne(cg => cg.Genre)
                .WithMany(g => g.ComicGenres)
                .HasForeignKey(cg => cg.GenresId);

            modelBuilder.Entity<Comic>()
                .HasMany(c => c.Details)
                .WithOne(d => d.Comic)
                .HasForeignKey(d => d.ComicId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ComicDetails>()
                .HasOne(d => d.Shop)
                .WithMany()
                .HasForeignKey(d => d.ShopId)
                .IsRequired(false);

            modelBuilder.Entity<ComicDetails>()
                .Property(c => c.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Comic>()
                .HasMany(c => c.Types)
                .WithMany()
                .UsingEntity(j => j.ToTable("ComicComicTypes"));

            modelBuilder.Entity<Genre>().HasData(
                new Genre { Id = 1, Name = "Action" },
                new Genre { Id = 2, Name = "Adventure" },
                new Genre { Id = 3, Name = "Comedy" },
                new Genre { Id = 4, Name = "Drama" },
                new Genre { Id = 5, Name = "Fantasy" },
                new Genre { Id = 6, Name = "Horror" },
                new Genre { Id = 7, Name = "Bestseller"}
            );

            modelBuilder.Entity<Shop>().HasData(
                new Shop { Id = 1, Name = "Comic Store" },
                new Shop { Id = 2, Name = "Book Nook" },
                new Shop { Id = 3, Name = "Graphic Novel Haven" },
                new Shop { Id = 4, Name = "World of Comics" }
            );

            modelBuilder.Entity<ComicType>().HasData(
                new ComicType { Id = 1, Name = "Marvel" },
                new ComicType { Id = 2, Name = "DC" },
                new ComicType { Id = 3, Name = "TMNT" },
                new ComicType { Id = 4, Name = "Invincible" }
            );
        }
    }
}