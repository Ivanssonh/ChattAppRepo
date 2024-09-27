using ChattApp.Server.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace ChattApp.Server.Domain.Identity;

public class ChatUser : IdentityUser
{
    ICollection<ChatMessageEntity> Messages { get; set; } = null!; // Navigation prop
}
