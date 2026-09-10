using Comics.Data;
using Comics.Endpoint;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Реєстрація сервісів
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ComicsDbContext>(options =>
    options.UseSqlServer(connectionString));

// Налаштування System.Text.Json для Minimal APIs
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Налаштування System.Text.Json для Controllers (якщо використовуєте і їх)
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Налаштування CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularJS", policy =>
        policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

app.UseCors("AllowLiveServer");

// 2. Налаштування Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// ВАЖЛИВО: UseCors має йти ПЕРЕД MapComicsEndpoints, MapControllers та UseAuthorization
app.UseCors("AllowAngularJS");

app.UseAuthorization();

// 3. Маппінг ендпоінтів
ComicsEndpoints.MapComicsEndpoints(app);
ReportEndpoints.MapComicsEndpoints(app);
app.MapControllers();

app.Run();