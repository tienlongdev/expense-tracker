using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SavingsController : ControllerBase
{
    private readonly ISavingsService _service;

    public SavingsController(ISavingsService service)
    {
        _service = service;
    }

    // ========================
    // CRUD
    // ========================

    // GET api/savings
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    // GET api/savings/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null
            ? NotFound(new { message = $"Không tìm thấy tài khoản {id}" })
            : Ok(result);
    }

    // POST api/savings
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSavingsAccountDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT api/savings/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSavingsAccountDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.UpdateAsync(id, dto);
            return result is null
                ? NotFound(new { message = $"Không tìm thấy tài khoản {id}" })
                : Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // DELETE api/savings/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            return success ? NoContent() : NotFound(new { message = $"Không tìm thấy tài khoản {id}" });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ========================
    // Filter
    // ========================

    // GET api/savings/type/1
    [HttpGet("type/{type:int}")]
    public async Task<IActionResult> GetByType(int type)
    {
        if (!Enum.IsDefined(typeof(SavingsType), type))
            return BadRequest(new { message = "Loại không hợp lệ. 1=Tiết kiệm 2=CK 3=Vàng 4=Crypto 5=BĐS 6=Quỹ 7=Khác" });

        return Ok(await _service.GetByTypeAsync((SavingsType)type));
    }

    // GET api/savings/status/1
    [HttpGet("status/{status:int}")]
    public async Task<IActionResult> GetByStatus(int status)
    {
        if (!Enum.IsDefined(typeof(SavingsStatus), status))
            return BadRequest(new { message = "Trạng thái không hợp lệ. 1=Active 2=Matured 3=Closed" });

        return Ok(await _service.GetByStatusAsync((SavingsStatus)status));
    }

    // GET api/savings/maturing?withinDays=30
    [HttpGet("maturing")]
    public async Task<IActionResult> GetMaturing([FromQuery] int withinDays = 30)
        => Ok(await _service.GetMaturingAsync(withinDays));

    // ========================
    // Summary
    // ========================

    // GET api/savings/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
        => Ok(await _service.GetSummaryAsync());

    // ========================
    // Transactions
    // ========================

    // POST api/savings/{id}/deposit — Nạp thêm vốn
    [HttpPost("{id:guid}/deposit")]
    public async Task<IActionResult> Deposit(Guid id, [FromBody] SavingsDepositDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        return await ExecuteTransactionAsync(() => _service.DepositAsync(id, dto));
    }

    // POST api/savings/{id}/withdraw — Rút vốn
    [HttpPost("{id:guid}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid id, [FromBody] SavingsWithdrawDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        return await ExecuteTransactionAsync(() => _service.WithdrawAsync(id, dto));
    }

    // POST api/savings/{id}/update-value — ⭐ Cập nhật giá trị → tính lời/lỗ
    [HttpPost("{id:guid}/update-value")]
    public async Task<IActionResult> UpdateValue(Guid id, [FromBody] UpdateSavingsValueDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        return await ExecuteTransactionAsync(() => _service.UpdateValueAsync(id, dto));
    }

    // POST api/savings/{id}/interest — Ghi nhận nhận lãi
    [HttpPost("{id:guid}/interest")]
    public async Task<IActionResult> AddInterest(Guid id, [FromBody] SavingsInterestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        return await ExecuteTransactionAsync(() => _service.AddInterestAsync(id, dto));
    }

    // ========================
    // History
    // ========================

    // GET api/savings/{id}/history
    [HttpGet("{id:guid}/history")]
    public async Task<IActionResult> GetHistory(Guid id)
    {
        try
        {
            return Ok(await _service.GetHistoryAsync(id));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    // ========================
    // Close
    // ========================

    // POST api/savings/{id}/close
    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id, [FromBody] CloseAccountDto? dto = null)
    {
        try
        {
            var result = await _service.CloseAsync(id, dto?.Note);
            return result is null
                ? NotFound(new { message = $"Không tìm thấy tài khoản {id}" })
                : Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    // ========================
    // Helper
    // ========================

    private async Task<IActionResult> ExecuteTransactionAsync(Func<Task<SavingsHistoryDto>> action)
    {
        try
        {
            var result = await action();
            return Ok(result);
        }
        catch (KeyNotFoundException ex)     { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex){ return BadRequest(new { message = ex.Message }); }
    }
}
