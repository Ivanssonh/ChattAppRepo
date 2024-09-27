using ChattApp.Server.Data;
using ChattApp.Server.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace ChattApp.Server.Hubs;

public class ChatHub(ChatDbContext context) : Hub
{
    private readonly ChatDbContext _context = context;

         public override async Task OnConnectedAsync()
    {

    
        var messages = _context.ChatMessages
            .OrderBy(m => m.Timestamp)
            .Take(50) 
            .ToList();

        foreach (var message in messages)
        {
            await Clients.Caller.SendAsync("ReceiveMessage", message.Username, message.Message);
        }
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string user, string message)
    {
        var chatMessage = new ChatMessageEntity
        {
            Username = user,
            Message = message
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync(); 

        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
