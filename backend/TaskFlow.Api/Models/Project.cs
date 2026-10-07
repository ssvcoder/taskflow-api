namespace TaskFlow.Api.Models;

public class Project
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Every project belongs to exactly one user.
    public int UserId { get; set; }
    public User? User { get; set; }

    public List<TaskItem> Tasks { get; set; } = new();
}
