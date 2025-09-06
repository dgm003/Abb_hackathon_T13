using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DateRangeController : ControllerBase
    {
        private readonly IDateRangeService _dateRangeService;

        public DateRangeController(IDateRangeService dateRangeService)
        {
            _dateRangeService = dateRangeService;
        }

        [HttpPost("validate")]
        public async Task<ActionResult<DateRangeResponse>> ValidateDateRanges([FromBody] DateRangeRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new DateRangeResponse
                    {
                        IsValid = false,
                        Message = "Invalid request data"
                    });
                }

                Console.WriteLine($"Received date range request: Training {request.TrainingStart} to {request.TrainingEnd}");
                var result = await _dateRangeService.ValidateDateRangesAsync(request);
                Console.WriteLine($"Generated {result.Periods.Count} periods and {result.MonthlyData.Count} monthly data points");
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new DateRangeResponse
                {
                    IsValid = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", service = "DateRangeController" });
        }
    }
}
