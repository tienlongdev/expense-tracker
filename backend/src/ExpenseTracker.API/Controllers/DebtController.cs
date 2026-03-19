using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebtController : ControllerBase
{
    private readonly IDebtService _service;

    public DebtController(IDebtService service)
    {
        _service = service;
    }

    // ========================
    // CRUD
    // ========================

    // GET api/debt
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/debt/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null
            ? NotFound(new { message = $"Không tìm thấy khoản nợ {id}" })
            : Ok(result);
    }

    // POST api/debt
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDebtDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT api/debt/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDebtDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, dto);
        return result is null
            ? NotFound(new { message = $"Không tìm thấy khoản nợ {id}" })
            : Ok(result);
    }

    // DELETE api/debt/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            return success ? NoContent() : NotFound(new { message = $"Không tìm thấy khoản nợ {id}" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ========================
    // Filter
    // ========================

    // GET api/debt/type/1  (1=Borrowed, 2=Lent)
    [HttpGet("type/{type:int}")]
    public async Task<IActionResult> GetByType(int type)
    {
        if (!Enum.IsDefined(typeof(DebtType), type))
            return BadRequest(new { message = "Loại không hợp lệ. 1 = Bạn đang vay, 2 = Bạn cho mượn" });

        return Ok(await _service.GetByTypeAsync((DebtType)type));
    }

    // GET api/debt/status/1  (1=Unpaid, 2=PartiallyPaid, 3=Paid)
    [HttpGet("status/{status:int}")]
    public async Task<IActionResult> GetByStatus(int status)
    {
        if (!Enum.IsDefined(typeof(DebtStatus), status))
            return BadRequest(new { message = "Trạng thái không hợp lệ. 1=Chưa trả, 2=Trả một phần, 3=Đã trả hết" });

        return Ok(await _service.GetByStatusAsync((DebtStatus)status));
    }

    // GET api/debt/overdue
    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue()
        => Ok(await _service.GetOverdueAsync());

    // ========================
    // Summary
    // ========================

    // GET api/debt/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
        => Ok(await _service.GetSummaryAsync());

    // ========================
    // Payments
    // ========================

    // GET api/debt/{id}/payments
    [HttpGet("{id:guid}/payments")]
    public async Task<IActionResult> GetPayments(Guid id)
    {
        var debt = await _service.GetByIdAsync(id);
        if (debt is null) return NotFound(new { message = $"Không tìm thấy khoản nợ {id}" });

        return Ok(await _service.GetPaymentsAsync(id));
    }

    // POST api/debt/{id}/payments
    [HttpPost("{id:guid}/payments")]
    public async Task<IActionResult> AddPayment(Guid id, [FromBody] CreateDebtPaymentDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.AddPaymentAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}