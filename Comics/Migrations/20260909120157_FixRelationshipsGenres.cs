using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comics.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationshipsGenres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComicDetailsGenres");

            migrationBuilder.CreateTable(
                name: "ComicGenres",
                columns: table => new
                {
                    ComicId = table.Column<int>(type: "int", nullable: false),
                    GenresId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComicGenres", x => new { x.ComicId, x.GenresId });
                    table.ForeignKey(
                        name: "FK_ComicGenres_Comics_ComicId",
                        column: x => x.ComicId,
                        principalTable: "Comics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComicGenres_Genres_GenresId",
                        column: x => x.GenresId,
                        principalTable: "Genres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComicGenres_GenresId",
                table: "ComicGenres",
                column: "GenresId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ComicGenres");

            migrationBuilder.CreateTable(
                name: "ComicDetailsGenres",
                columns: table => new
                {
                    ComicDetailsId = table.Column<int>(type: "int", nullable: false),
                    GenresId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComicDetailsGenres", x => new { x.ComicDetailsId, x.GenresId });
                    table.ForeignKey(
                        name: "FK_ComicDetailsGenres_ComicDetails_ComicDetailsId",
                        column: x => x.ComicDetailsId,
                        principalTable: "ComicDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ComicDetailsGenres_Genres_GenresId",
                        column: x => x.GenresId,
                        principalTable: "Genres",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComicDetailsGenres_GenresId",
                table: "ComicDetailsGenres",
                column: "GenresId");
        }
    }
}
