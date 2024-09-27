using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChattApp.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemovedUserName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Username",
                table: "ChatMessages");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "ChatMessages",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
