using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Comics.Migrations
{
    /// <inheritdoc />
    public partial class AddBestsellerIntoGenre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Genres",
                columns: new[] { "Id", "Name" },
                values: new object[] { 7, "Bestseller" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Genres",
                keyColumn: "Id",
                keyValue: 7);
        }
    }
}
