using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SimulationController : ControllerBase
    {
        private readonly ISimulationService _simulationService;

        public SimulationController(ISimulationService simulationService)
        {
            _simulationService = simulationService;
        }

        [HttpPost("start")]
        public async Task<ActionResult<SimulationStartResponse>> StartSimulation()
        {
            var result = await _simulationService.StartSimulationAsync();
            return Ok(result);
        }

        [HttpGet("next")]
        public async Task<ActionResult<SimulationData?>> GetNextPrediction()
        {
            var result = await _simulationService.GetNextPredictionAsync();
            return Ok(result);
        }

        [HttpGet("stats")]
        public async Task<ActionResult<SimulationStats>> GetStats()
        {
            var result = await _simulationService.GetSimulationStatsAsync();
            return Ok(result);
        }
    }
}
