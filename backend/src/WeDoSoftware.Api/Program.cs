using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using WeDoSoftware.Api.Filters;
using WeDoSoftware.Api.Middleware;
using WeDoSoftware.Application;
using WeDoSoftware.Infrastructure;
using WeDoSoftware.Infrastructure.Configuration;
using WeDoSoftware.Infrastructure.Persistence;

// docker-compose already maps the repo-root `.env` file to the right container env vars (see
// docker-compose.yml). Running the API directly via `dotnet run` skips that translation entirely,
// so the SMTP credentials in `.env` were silently never picked up and password-reset emails just
// logged instead of sending. This mirrors the same mapping for that path, without touching anything
// when the real env vars are already set (Docker, CI, production).
LoadDotEnvSmtpSettings();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// --- Authentication (JWT bearer) ---
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
if (string.IsNullOrWhiteSpace(jwtOptions.Secret))
    throw new InvalidOperationException("JWT signing secret is not configured (Jwt:Secret).");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

builder.Services
    .AddControllers(options => options.Filters.Add<FluentValidationFilter>())
    .AddJsonOptions(options =>
        // Serialize/accept enums as their names (e.g. "Female", "Cardio"), cleaner API, matches DB storage.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// --- Swagger with JWT support ---
builder.Services.AddSwaggerGen(options =>
{
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT access token (without the 'Bearer' prefix)."
    };
    options.AddSecurityDefinition("Bearer", scheme);
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer", document), new List<string>() }
    });
});

// --- Problem Details + global exception handling ---
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// --- CORS (frontend origin, cookies allowed) ---
const string corsPolicy = "AllowFrontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicy, policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

// Apply migrations and seed demo data on startup so the database is ready out of the box.
await DbSeeder.InitializeAsync(app.Services);

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(corsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposed for integration testing (WebApplicationFactory).
public partial class Program
{
    static void LoadDotEnvSmtpSettings()
    {
        var envFile = FindDotEnvFile();
        if (envFile is null) return;

        var values = ParseEnvFile(envFile);
        SetIfAbsent("Smtp__Username", values, "SMTP_USERNAME");
        SetIfAbsent("Smtp__Password", values, "SMTP_PASSWORD");
        SetIfAbsent("Smtp__FromAddress", values, "SMTP_FROM_ADDRESS");
        SetIfAbsent("App__FrontendBaseUrl", values, "FRONTEND_BASE_URL");
    }

    static string? FindDotEnvFile()
    {
        var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
        for (var i = 0; i < 6 && directory is not null; i++, directory = directory.Parent)
        {
            var candidate = Path.Combine(directory.FullName, ".env");
            if (File.Exists(candidate)) return candidate;
        }
        return null;
    }

    static Dictionary<string, string> ParseEnvFile(string path)
    {
        var values = new Dictionary<string, string>();
        foreach (var line in File.ReadAllLines(path))
        {
            var trimmed = line.Trim();
            if (trimmed.Length == 0 || trimmed.StartsWith('#')) continue;

            var separator = trimmed.IndexOf('=');
            if (separator <= 0) continue;

            values[trimmed[..separator].Trim()] = trimmed[(separator + 1)..].Trim();
        }
        return values;
    }

    static void SetIfAbsent(string configKey, Dictionary<string, string> values, string envFileKey)
    {
        if (Environment.GetEnvironmentVariable(configKey) is not null) return;
        if (values.TryGetValue(envFileKey, out var value) && !string.IsNullOrWhiteSpace(value))
        {
            Environment.SetEnvironmentVariable(configKey, value);
        }
    }
}
