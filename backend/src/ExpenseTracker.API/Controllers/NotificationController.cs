using ExpenseTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _service;

    public NotificationController(INotificationService service)
        => _service = service;

    // GET api/notification
    // GET api/notification?onlyUnread=true
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool onlyUnread = false)
    {
        var result = await _service.GetAllAsync(onlyUnread);
        return Ok(result);
    }

    // GET api/notification/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _service.GetUnreadCountAsync();
        return Ok(new { count });
    }

    // PATCH api/notification/{id}/read
    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var success = await _service.MarkAsReadAsync(id);
        if (!success) return NotFound(new { message = $"Notification {id} not found" });
        return NoContent();
    }

    // PATCH api/notification/read-all
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _service.MarkAllAsReadAsync();
        return NoContent();
    }

    // DELETE api/notification/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound(new { message = $"Notification {id} not found" });
        return NoContent();
    }
}
