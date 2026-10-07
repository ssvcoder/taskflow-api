namespace TaskFlow.Api.Models;

// Stored as integers in PostgreSQL by EF Core.
public enum TaskStatus
{
    Todo = 0,
    InProgress = 1,
    Done = 2
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}
