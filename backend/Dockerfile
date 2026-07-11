# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files first so `restore` is cached until a .csproj actually changes.
COPY src/WeDoSoftware.Domain/WeDoSoftware.Domain.csproj src/WeDoSoftware.Domain/
COPY src/WeDoSoftware.Application/WeDoSoftware.Application.csproj src/WeDoSoftware.Application/
COPY src/WeDoSoftware.Infrastructure/WeDoSoftware.Infrastructure.csproj src/WeDoSoftware.Infrastructure/
COPY src/WeDoSoftware.Api/WeDoSoftware.Api.csproj src/WeDoSoftware.Api/
RUN dotnet restore src/WeDoSoftware.Api/WeDoSoftware.Api.csproj

# Copy the remaining source and publish a framework-dependent build.
COPY . .
RUN dotnet publish src/WeDoSoftware.Api/WeDoSoftware.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
# Kerberos GSSAPI lib so Npgsql doesn't log a (harmless) probe error on the minimal image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "WeDoSoftware.Api.dll"]
