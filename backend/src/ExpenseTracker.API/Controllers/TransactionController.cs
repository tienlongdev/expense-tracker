using ExpenseTracker.Application.DTOs;
using ExpenseTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _service;

    public TransactionController(ITransactionService service)
    {
        _service = service;
    }

    // ========================
    // CRUD
    // ========================

    // GET api/transaction
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // GET api/transaction/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result is null)
            return NotFound(new { message = $"Transaction {id} not found" });

        return Ok(result);
    }

    // POST api/transaction
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT api/transaction/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTransactionDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _service.UpdateAsync(id, dto);
        if (result is null)
            return NotFound(new { message = $"Transaction {id} not found" });

        return Ok(result);
    }

    // DELETE api/transaction/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success)
            return NotFound(new { message = $"Transaction {id} not found" });

        return NoContent();
    }

    // ========================
    // Filter
    // ========================

    // GET api/transaction/filter/date?date=2026-03-18
    [HttpGet("filter/date")]
    public async Task<IActionResult> GetByDate([FromQuery] DateTime date)
    {
        var result = await _service.GetByDateAsync(date);
        return Ok(result);
    }

    // GET api/transaction/filter/month?year=2026&month=3
    [HttpGet("filter/month")]
    public async Task<IActionResult> GetByMonth(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "Month must be between 1 and 12" });

        var result = await _service.GetByMonthAsync(year, month);
        return Ok(result);
    }

    // GET api/transaction/filter/year?year=2026
    [HttpGet("filter/year")]
    public async Task<IActionResult> GetByYear([FromQuery] int year)
    {
        var result = await _service.GetByYearAsync(year);
        return Ok(result);
    }

    // ========================
    // Summary
    // ========================

    // GET api/transaction/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var result = await _service.GetSummaryAsync();
        return Ok(result);
    }

    // GET api/transaction/summary/month?year=2026&month=3
    [HttpGet("summary/month")]
    public async Task<IActionResult> GetSummaryByMonth(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        if (month < 1 || month > 12)
            return BadRequest(new { message = "Month must be between 1 and 12" });

        var result = await _service.GetSummaryByMonthAsync(year, month);
        return Ok(result);
    }

    // GET api/transaction/summary/year?year=2026
    [HttpGet("summary/year")]
    public async Task<IActionResult> GetSummaryByYear([FromQuery] int year)
    {
        var result = await _service.GetSummaryByYearAsync(year);
        return Ok(result);
    }

    // ========================
    // Report
    // ========================

    // GET api/transaction/report/yearly?year=2026
    [HttpGet("report/yearly")]
    public async Task<IActionResult> GetYearlyReport([FromQuery] int year)
    {
        var result = await _service.GetYearlyReportAsync(year);
        return Ok(result);
    }
}