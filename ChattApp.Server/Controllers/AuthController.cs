using ChattApp.Server.Domain.DTO;
using ChattApp.Server.Domain.Identity;
using ChattApp.Server.Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChattApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(SignInManager<ChatUser> signInManager, UserManager<ChatUser> userManager, ILogger<AuthController> logger) : ControllerBase
{
    private readonly SignInManager<ChatUser> _signInManager = signInManager;
    private readonly UserManager<ChatUser> _userManager = userManager;
    private readonly ILogger<AuthController> _logger;

    [HttpPost]
    [Route("register")]

    public async Task<IActionResult> Register(UserModel model)
    {
        try
        {
            if (ModelState.IsValid)
            {
                if (!await _userManager.Users.AnyAsync(x => x.Email == model.Email))
                {
                    var chatUser = new ChatUser
                    {
                        UserName = model.UserName,
                        Email = model.Email,
                    };
                    var registerResult = await _userManager.CreateAsync(chatUser, model.Password);
                    if (registerResult.Succeeded)
                    {
                        return Ok();
                    }
                }
            }
            return BadRequest();

        }
        catch (Exception ex)
        {
            _logger.LogError($"ERROR : AuthController:Register() :: {ex.Message}");
            return BadRequest();
        }
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login(loginUserModel model)
    {
        try
        {
            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByNameAsync(model.UserName);  // Hämta användare baserat på användarnamn
                if (user == null)
                {
                    return Unauthorized("Invalid username or password");
                }

                var signInResult = await _signInManager.PasswordSignInAsync(user.UserName!, model.Password, false, false);
                if (signInResult.Succeeded)
                {
                    var token = GenerateJwtToken(user);

                    return Ok(new { token });
                }
            }
            return Unauthorized("Invalid username or password");
        }
        catch (Exception ex)
        {
            _logger.LogError($"ERROR : AuthController:Login() :: {ex.Message}");
            return BadRequest();
        }
    }


    private static string GenerateJwtToken(ChatUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("d5df9b30d5891d6e19c3eda79aef6fa0181cb5f0da195f2bbb54022c7d217b1b"); // private key

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
            new Claim(ClaimTypes.Name, user.UserName!) // Använd ChatUser
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

        


 
