using ChattApp.Server.Data;
using ChattApp.Server.Domain.Identity;
using ChattApp.Server.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
    builder.WithOrigins("https://localhost:5173")
           .AllowAnyHeader()
           .AllowAnyMethod()
           .AllowCredentials());
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("d5df9b30d5891d6e19c3eda79aef6fa0181cb5f0da195f2bbb54022c7d217b1b")) // Replace with your secret key
        };

        // Handle the JWT in the SignalR connection
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Check for the access token in the query string
                var accessToken = context.Request.Query["access_token"];

                // If found, set it
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5215); // HTTP
    options.ListenAnyIP(7039, listenOptions =>
    {
        listenOptions.UseHttps(); // HTTPS
    });
});


builder.Services.AddAuthorization();

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.MapHub<ChatHub>("/chathub");
app.Run();
