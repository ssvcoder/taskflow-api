namespace TaskFlow.Api.Models;

// Named TaskItem because "Task" collides with System.Threading.Tasks.Task.
public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.Todo;

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Every task belongs to exactly one project.
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
}
