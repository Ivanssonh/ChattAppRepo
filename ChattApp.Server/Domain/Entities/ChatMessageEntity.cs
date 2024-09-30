using ChattApp.Server.Domain.Identity;

namespace ChattApp.Server.Domain.Entities;

public class ChatMessageEntity
{
    public int Id { get; set; } 
    public string Message { get; set; } = null!; 
    public DateTime Timestamp { get; set; } = DateTime.UtcNow; 

    public string userId { get; set; } = null!;
    public ChatUser User { get; set; } = null!; 
}
