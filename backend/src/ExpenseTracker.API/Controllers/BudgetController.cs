using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _service;

    public BudgetController(IBudgetService service)
    {
        _service = service;
    }

    // ========================
    // CRUD
    // ========================

    // GET api/budget?year=2026&month=3
    [HttpGet]
    public async Task<IActionResult> GetByMonth(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "Tháng phải từ 1 đến 12" });

        return Ok(await _service.GetByMonthAsync(year, month));
    }

    // GET api/budget/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null
            ? NotFound(new { message = $"Không tìm thấy ngân sách {id}" })
            : Ok(result);
    }

    // POST api/budget
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBudgetDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException   ex) { return NotFound(new   { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    // PUT api/budget/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBudgetDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, dto);
        return result is null
            ? NotFound(new { message = $"Không tìm thấy ngân sách {id}" })
            : Ok(result);
    }

    // DELETE api/budget/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound(new { message = $"Không tìm thấy ngân sách {id}" });
    }

    // ========================
    // Overview
    // ========================

    // GET api/budget/overview?year=2026&month=3
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "Tháng phải từ 1 đến 12" });

        return Ok(await _service.GetOverviewAsync(year, month));
    }

    // GET api/budget/overview/yearly?year=2026
    [HttpGet("overview/yearly")]
    public async Task<IActionResult> GetYearlyOverview([FromQuery] int year)
        => Ok(await _service.GetYearlyOverviewAsync(year));

    // ========================
    // Bulk operations
    // ========================

    // POST api/budget/bulk
    // Body: { year, month, items: [{categoryId, plannedAmount}] }
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkUpsert([FromBody] BulkUpsertBudgetDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.BulkUpsertAsync(dto);
        return Ok(new
        {
            message = $"Đã lưu {result.Count()} ngân sách cho tháng {dto.Month}/{dto.Year}",
            data    = result
        });
    }

    // POST api/budget/copy
    // Body: { fromYear, fromMonth, toYear, toMonth, overwrite }
    [HttpPost("copy")]
    public async Task<IActionResult> CopyFromMonth([FromBody] CopyBudgetDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.CopyFromMonthAsync(dto);
            return Ok(new
            {
                message          = result.Message,
                created          = result.Created,
                skipped          = result.Skipped,
                overwritten      = result.Overwritten
            });
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }
}