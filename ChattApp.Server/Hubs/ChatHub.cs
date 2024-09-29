using ChattApp.Server.Data;
using ChattApp.Server.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChattApp.Server.Hubs;

[Authorize]  // Endast inloggade användare får tillgång
public class ChatHub : Hub
{
    private readonly ChatDbContext _context;

    // Konstruktor för att injicera ChatDbContext
    public ChatHub(ChatDbContext context)
    {
        _context = context;
    }

    // Vid anslutning, skicka de senaste meddelandena till den nya klienten
    public override async Task OnConnectedAsync()
    {
        // Hämta de senaste 20 meddelandena och inkludera användarinformation
        var messages = await _context.ChatMessages
            .Include(m => m.User)  // Ladda användarinformation
            .OrderByDescending(m => m.Timestamp)
            .Take(20)
            .ToListAsync();

        // Skicka meddelandena till den anslutande klienten
        foreach (var message in messages.OrderBy(m => m.Timestamp))  // Sortera meddelanden i rätt ordning
        {
            await Clients.Caller.SendAsync("ReceiveMessage", message.User.UserName, message.Message, message.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"));
        }

        await base.OnConnectedAsync();
    }

    // När ett meddelande skickas av en klient
    public async Task SendMessage(string message)
    {
        // Hämta användarnamn från SignalR:s context
        var userName = Context.User?.Identity?.Name;

        if (string.IsNullOrEmpty(userName))
        {
            throw new HubException("Användaren är inte inloggad.");
        }

        // Hämta användarens ID från SignalR:s context
        var userId = Context.UserIdentifier;

        if (string.IsNullOrEmpty(userId))
        {
            throw new HubException("User identifier not found.");
        }

        // Skapa ett nytt meddelande och spara UserId istället för UserName
        var chatMessage = new ChatMessageEntity
        {
            userId = userId,  // Spara userId som foreign key
            Message = message,
            Timestamp = DateTime.Now
        };

        // Lägg till meddelandet i databasen
        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        // Skicka meddelandet till alla andra klienter
        await Clients.All.SendAsync("ReceiveMessage", userName, message, chatMessage.Timestamp.ToString("yyyy-MM-dd HH:mm:ss"));
    }
}
