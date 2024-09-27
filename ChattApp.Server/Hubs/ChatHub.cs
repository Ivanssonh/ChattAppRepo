using ChattApp.Server.Data;
using ChattApp.Server.Domain.Entities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ChattApp.Server.Hubs;

public class ChatHub(ChatDbContext context) : Hub
{
    private readonly ChatDbContext _context = context;

    // Vid anslutning, skicka de senaste meddelandena till den nya klienten
    public override async Task OnConnectedAsync()
    {
        // Hämta de senaste 50 meddelandena och inkludera användarinformation
        var messages = await _context.ChatMessages
            .Include(m => m.User) // Ladda användarinformation
            .OrderBy(m => m.Timestamp)
            .Take(50)
            .ToListAsync();

        foreach (var message in messages)
        {
            // Skicka meddelandet med användarnamnet (från User-tabellen) och själva meddelandet
            await Clients.Caller.SendAsync("ReceiveMessage", message.User.UserName, message.Message);
        }

        await base.OnConnectedAsync();
    }

    // När ett meddelande skickas av en klient
    public async Task SendMessage(string message)
    {
        // Hämta användarnamn från SignalR:s context
        var userName = Context.User.Identity.Name;
        if (userName == null)
        {
            throw new Exception("Användaren är inte inloggad");
        }

        // Hämta användarens ID från SignalR:s context
        var userId = Context.UserIdentifier;

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

        // Skicka meddelandet till alla klienter med användarnamnet och meddelandet
        await Clients.All.SendAsync("ReceiveMessage", userName, message);
    }
}