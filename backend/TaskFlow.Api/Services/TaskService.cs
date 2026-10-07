using Microsoft.EntityFrameworkCore;
using TaskFlow.Api.Data;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Models;
using TaskStatus = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db)
    {
        _db = db;
    }

    // Every method first confirms the project belongs to the user,
    // so users can never see or touch each other's tasks.
    public async Task<List<TaskDto>> GetByProjectAsync(int userId, int projectId)
    {
        var ownsProject = await _db.Projects.AnyAsync(p => p.Id == projectId && p.UserId == userId);
        if (!ownsProject)
            return new List<TaskDto>();

        return await _db.Tasks
            .Where(t => t.ProjectId == projectId)
            .OrderBy(t => t.Status)
            .ThenByDescending(t => t.Priority)
            .Select(t => Map(t))
            .ToListAsync();
    }

    public async Task<TaskDto?> GetByIdAsync(int userId, int taskId)
    {
        var task = await _db.Tasks
            .Include(t => t.Project)
            .SingleOrDefaultAsync(t => t.Id == taskId && t.Project!.UserId == userId);

        return task is null ? null : Map(task);
    }

    public async Task<TaskDto?> CreateAsync(int userId, int projectId, CreateTaskRequest request)
    {
        var ownsProject = await _db.Projects.AnyAsync(p => p.Id == projectId && p.UserId == userId);
        if (!ownsProject)
            return null;

        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Status = request.Status,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ProjectId = projectId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return Map(task);
    }

    public async Task<TaskDto?> UpdateAsync(int userId, int taskId, UpdateTaskRequest request)
    {
        var task = await _db.Tasks
            .Include(t => t.Project)
            .SingleOrDefaultAsync(t => t.Id == taskId && t.Project!.UserId == userId);

        if (task is null)
            return null;

        task.Title = request.Title.Trim();
        task.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;

        await _db.SaveChangesAsync();
        return Map(task);
    }

    public async Task<bool> DeleteAsync(int userId, int taskId)
    {
        var task = await _db.Tasks
            .Include(t => t.Project)
            .SingleOrDefaultAsync(t => t.Id == taskId && t.Project!.UserId == userId);

        if (task is null)
            return false;

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return true;
    }

    private static TaskDto Map(TaskItem t) => new()
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
