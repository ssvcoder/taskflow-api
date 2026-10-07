using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Services;

public interface ITaskService
{
    Task<List<TaskDto>> GetByProjectAsync(int userId, int projectId);
    Task<TaskDto?> GetByIdAsync(int userId, int taskId);
    Task<TaskDto?> CreateAsync(int userId, int projectId, CreateTaskRequest request);
    Task<TaskDto?> UpdateAsync(int userId, int taskId, UpdateTaskRequest request);
    Task<bool> DeleteAsync(int userId, int taskId);
}
