using ChattApp.Server.Data;
using ChattApp.Server.Domain.Identity;
using ChattApp.Server.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddDbContext<ChatDbContext>(x => x.UseSqlite(builder.Configuration.GetConnectionString("SqlConnection")));
builder.Services.AddDefaultIdentity<ChatUser>(x =>
{
    x.User.RequireUniqueEmail = true;
    x.SignIn.RequireConfirmedEmail = false;
    x.Password.RequiredLength = 8;

}).AddEntityFrameworkStores<ChatDbContext>();

builder.Services.AddCors(options =>
{
options.AddPolicy("AllowAll", builder =>
    builder.AllowAnyOrigin()
           .AllowAnyHeader()
           .AllowAnyMethod());
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAll");


app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.MapHub<ChatHub>("/chathub");
app.Run();
