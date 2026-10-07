using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskFlow.Api.DTOs;
using TaskFlow.Api.Services;

namespace TaskFlow.Api.Controllers;

[ApiController]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _tasks;

    public TasksController(ITaskService tasks)
    {
        _tasks = tasks;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Tasks are listed and created in the context of their project.
    [HttpGet("api/projects/{projectId:int}/tasks")]
    public async Task<ActionResult<List<TaskDto>>> GetByProject(int projectId)
    {
        return Ok(await _tasks.GetByProjectAsync(CurrentUserId, projectId));
    }

    [HttpPost("api/projects/{projectId:int}/tasks")]
    public async Task<ActionResult<TaskDto>> Create(int projectId, CreateTaskRequest request)
    {
        var task = await _tasks.CreateAsync(CurrentUserId, projectId, request);
        return task is null ? NotFound() : CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }

    // Single-task operations use the flat /api/tasks route.
    [HttpGet("api/tasks/{id:int}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var task = await _tasks.GetByIdAsync(CurrentUserId, id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPut("api/tasks/{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(int id, UpdateTaskRequest request)
    {
        var task = await _tasks.UpdateAsync(CurrentUserId, id, request);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpDelete("api/tasks/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _tasks.DeleteAsync(CurrentUserId, id);
        return deleted ? NoContent() : NotFound();
    }
}
