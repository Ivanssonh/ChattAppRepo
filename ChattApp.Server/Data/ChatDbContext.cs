using ChattApp.Server.Domain.Entities;
using ChattApp.Server.Domain.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ChattApp.Server.Data;

public class ChatDbContext(DbContextOptions options) : IdentityDbContext<ChatUser>(options)
{
    public virtual DbSet<ChatMessageEntity> ChatMessages { get; set; }
}
