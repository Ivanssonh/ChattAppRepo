using ChattApp.Server.Domain.Identity;

namespace ChattApp.Server.Domain.Entities;

public class ChatMessageEntity
{
    public int Id { get; set; } // Auto-increment ID
    public string Message { get; set; } = null!; // Chat message
    public DateTime Timestamp { get; set; } = DateTime.UtcNow; // Timestamp when the message was sent

    public string userId { get; set; } = null!;
    public ChatUser User { get; set; } = null!; // Navigation prop
}
