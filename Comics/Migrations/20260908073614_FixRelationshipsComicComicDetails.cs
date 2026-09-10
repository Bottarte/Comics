using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comics.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationshipsComicComicDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComicDetails_ComicId",
                table: "ComicDetails");

            migrationBuilder.CreateIndex(
                name: "IX_ComicDetails_ComicId",
                table: "ComicDetails",
                column: "ComicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ComicDetails_ComicId",
                table: "ComicDetails");

            migrationBuilder.CreateIndex(
                name: "IX_ComicDetails_ComicId",
                table: "ComicDetails",
                column: "ComicId",
                unique: true);
        }
    }
}
