using TaskFlow.Api.DTOs;

namespace TaskFlow.Api.Services;

public interface IProjectService
{
    Task<List<ProjectDto>> GetAllAsync(int userId);
    Task<ProjectDetailDto?> GetByIdAsync(int userId, int projectId);
    Task<ProjectDto> CreateAsync(int userId, CreateProjectRequest request);
    Task<ProjectDto?> UpdateAsync(int userId, int projectId, UpdateProjectRequest request);
    Task<bool> DeleteAsync(int userId, int projectId);
}
