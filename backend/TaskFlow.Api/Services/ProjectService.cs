using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Data;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;
using TaskStatus = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;

    public ProjectService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProjectDto>> GetAllAsync(int userId)
    {
        return await _db.Projects
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                TaskCount = p.Tasks.Count,
                CompletedTaskCount = p.Tasks.Count(t => t.Status == TaskStatus.Done)
            })
            .ToListAsync();
    }

    public async Task<ProjectDetailDto?> GetByIdAsync(int userId, int projectId)
    {
        var project = await _db.Projects
            .Include(p => p.Tasks)
            .SingleOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project is null)
            return null;

        return new ProjectDetailDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            TaskCount = project.Tasks.Count,
            CompletedTaskCount = project.Tasks.Count(t => t.Status == TaskStatus.Done),
            Tasks = project.Tasks
                .OrderBy(t => t.Status)
                .ThenByDescending(t => t.Priority)
                .Select(MapTask)
                .ToList()
        };
    }

    public async Task<ProjectDto> CreateAsync(int userId, CreateProjectRequest request)
    {
        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            UserId = userId
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            TaskCount = 0,
            CompletedTaskCount = 0
        };
    }

    public async Task<ProjectDto?> UpdateAsync(int userId, int projectId, UpdateProjectRequest request)
    {
        var project = await _db.Projects
            .SingleOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project is null)
            return null;

        project.Name = request.Name.Trim();
        project.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        await _db.SaveChangesAsync();

        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            TaskCount = await _db.Tasks.CountAsync(t => t.ProjectId == project.Id),
            CompletedTaskCount = await _db.Tasks.CountAsync(t => t.ProjectId == project.Id && t.Status == TaskStatus.Done)
        };
    }

    public async Task<bool> DeleteAsync(int userId, int projectId)
    {
        var project = await _db.Projects
            .SingleOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

        if (project is null)
            return false;

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TaskDto MapTask(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Status = t.Status,
        Priority = t.Priority,
        DueDate = t.DueDate,
        CreatedAt = t.CreatedAt,
        ProjectId = t.ProjectId
    };
}
