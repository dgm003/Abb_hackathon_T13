using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SimulationController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SimulationController> _logger;

        public SimulationController(HttpClient httpClient, ILogger<SimulationController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartSimulation([FromBody] SimulationRequest request)
        {
            try
            {
                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("http://ml-service-python:8000/simulate", content);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(JsonSerializer.Deserialize<object>(result));
                }
                return BadRequest("Failed to start simulation");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting simulation");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
