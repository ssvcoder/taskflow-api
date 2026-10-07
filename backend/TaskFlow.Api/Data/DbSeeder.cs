using TaskFlow.Api.Models;
using TaskStatus = TaskFlow.Api.Models.TaskStatus;

namespace TaskFlow.Api.Data;

// Seeds a demo account with sample projects and tasks so the app is
// usable immediately after first run. Demo login: demo@taskflow.dev / demo1234
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Users.Any())
            return; // Database already has data.

        var demoUser = new User
        {
            Username = "demo",
            Email = "demo@taskflow.dev",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo1234")
        };

        var website = new Project
        {
            Name = "Website Redesign",
            Description = "Q1 homepage and landing page overhaul",
            User = demoUser,
            Tasks = new List<TaskItem>
            {
                new() { Title = "Create wireframes", Status = TaskStatus.Done, Priority = TaskPriority.High },
                new() { Title = "Implement landing page", Status = TaskStatus.InProgress, Priority = TaskPriority.High, DueDate = DateTime.UtcNow.AddDays(3) },
                new() { Title = "Write copy for about page", Status = TaskStatus.Todo, Priority = TaskPriority.Medium, DueDate = DateTime.UtcNow.AddDays(7) },
                new() { Title = "Optimize images", Status = TaskStatus.Todo, Priority = TaskPriority.Low },
            }
        };

        var mobileApp = new Project
        {
            Name = "Mobile App Launch",
            Description = "Tasks leading up to the v1.0 store release",
            User = demoUser,
            Tasks = new List<TaskItem>
            {
                new() { Title = "Set up CI pipeline", Status = TaskStatus.Done, Priority = TaskPriority.Medium },
                new() { Title = "Implement push notifications", Status = TaskStatus.InProgress, Priority = TaskPriority.High, DueDate = DateTime.UtcNow.AddDays(1) },
                new() { Title = "Beta testing", Status = TaskStatus.Todo, Priority = TaskPriority.High, DueDate = DateTime.UtcNow.AddDays(14) },
            }
        };

        db.Users.Add(demoUser);
        db.Projects.AddRange(website, mobileApp);
        db.SaveChanges();
    }
}
