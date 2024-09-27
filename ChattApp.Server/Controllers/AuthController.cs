using ChattApp.Server.Domain.DTO;
using ChattApp.Server.Domain.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                        return Created();
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
    public async Task<IActionResult> Login(UserModel model)
    {
        try
        {
            if (ModelState.IsValid)
            {
                var signInResult = await _signInManager.PasswordSignInAsync(model.UserName,model.Password, false, false);
                if (signInResult.Succeeded)
                {
                    return Ok();
                }
            }
            return Unauthorized("Not a valid user");
        }
        catch (Exception ex )
        {

            _logger.LogError($"ERROR : AuthController:Login() :: {ex.Message}");
            return BadRequest();
        }
    }

        
}

 
