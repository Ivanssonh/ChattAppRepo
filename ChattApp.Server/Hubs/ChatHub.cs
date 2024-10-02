using ChattApp.Server.Data;
using ChattApp.Server.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChattApp.Server.Hubs;

[Authorize] 
public class ChatHub(ChatDbContext context) : Hub
{
    private readonly ChatDbContext _context = context;

    public override async Task OnConnectedAsync()
    {
        if (Context.User?.Identity != null && Context.User.Identity.IsAuthenticated)
        {
            var messages = await _context.ChatMessages
            .Include(m => m.User)
            .OrderByDescending(m => m.Timestamp)
            .Take(20)
            .ToListAsync();

            
            foreach (var message in messages.OrderBy(m => m.Timestamp)) 
            {
                await Clients.Caller.SendAsync("ReceiveMessage", message.User.UserName, message.Message, message.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"));
            }

            await base.OnConnectedAsync();
        }
    }

    
    public async Task SendMessage(string message)
    {
        
        var userName = Context.User?.Identity?.Name;

        if (string.IsNullOrEmpty(userName))
        {
            throw new HubException("Användaren är inte inloggad.");
        }

       
        var userId = Context.UserIdentifier;

        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User identifier not found.");
        }

        
        var chatMessage = new ChatMessageEntity
        {
            userId = userId, 
            Message = message,
            Timestamp = DateTime.Now
        };

        
        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        
        await Clients.All.SendAsync("ReceiveMessage", userName, message, chatMessage.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"));
    }
}
