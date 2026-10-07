# Build the API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskFlow.Api.csproj", "./"]
RUN dotnet restore "TaskFlow.Api.csproj"
COPY . .
RUN dotnet publish "TaskFlow.Api.csproj" -c Release -o /app/publish

# Run the API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "TaskFlow.Api.dll"]
