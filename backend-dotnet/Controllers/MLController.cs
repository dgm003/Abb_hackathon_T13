using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MLController : ControllerBase
    {
        private readonly IMLService _mlService;

        public MLController(IMLService mlService)
        {
            _mlService = mlService;
        }

        public record RunRequest(string TrainPath, string TestPath, string SimulatePath, string TargetColumn = "Response");

        public record RunResponse(
            bool Success,
            string Message,
            object? TrainMetrics,
            object? TestMetrics,
            List<int>? SimulatedPredictions,
            List<double>? SimulatedProbabilities
        );

        [HttpPost("run")] // orchestrates train -> test -> simulate
        public async Task<ActionResult<RunResponse>> Run([FromBody] RunRequest request)
        {
            try
            {
                // Train
                var train = await _mlService.TrainAsync(request.TrainPath, request.TargetColumn);
                if (!train.Success)
                {
                    return BadRequest(new RunResponse(false, $"Training failed: {train.Message}", null, null, null, null));
                }

                // Test
                var test = await _mlService.TestAsync(request.TestPath, request.TargetColumn, train.ModelPath!, train.ScalerPath!);
                if (!test.Success)
                {
                    return BadRequest(new RunResponse(false, $"Testing failed: {test.Message}", train.Metrics, null, null, null));
                }

                // Simulate
                var sim = await _mlService.SimulateAsync(request.SimulatePath, train.ModelPath!, train.ScalerPath!);
                if (!sim.Success)
                {
                    return BadRequest(new RunResponse(false, $"Simulation failed: {sim.Message}", train.Metrics, test.Metrics, null, null));
                }

                return Ok(new RunResponse(true, "ML pipeline completed", train.Metrics, test.Metrics, sim.Predictions, sim.Probabilities));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RunResponse(false, ex.Message, null, null, null, null));
            }
        }

        public record TrainRequest(string TrainPath, string TargetColumn = "Response");
        public record TrainResponseDto(bool Success, string Message, object? Metrics, string? ModelPath, string? ScalerPath);

        [HttpPost("train")]
        public async Task<ActionResult<TrainResponseDto>> Train([FromBody] TrainRequest req)
        {
            try
            {
                var train = await _mlService.TrainAsync(req.TrainPath, req.TargetColumn);
                var success = train.Success || !string.IsNullOrWhiteSpace(train.ModelPath) || !string.IsNullOrWhiteSpace(train.ScalerPath);
                var message = string.IsNullOrWhiteSpace(train.Message) ? (success ? "Training completed" : "Training failed") : train.Message;
                return Ok(new TrainResponseDto(success, message, train.Metrics, train.ModelPath, train.ScalerPath));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new TrainResponseDto(false, ex.Message, null, null, null));
            }
        }

        public record TestRequestDto(string TestPath, string TargetColumn, string ModelPath, string ScalerPath);
        public record TestResponseDto(bool Success, string Message, object? Metrics);

        [HttpPost("test")]
        public async Task<ActionResult<TestResponseDto>> Test([FromBody] TestRequestDto req)
        {
            try
            {
                var test = await _mlService.TestAsync(req.TestPath, req.TargetColumn, req.ModelPath, req.ScalerPath);
                return Ok(new TestResponseDto(test.Success, test.Message, test.Metrics));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new TestResponseDto(false, ex.Message, null));
            }
        }

        public record SimRequestDto(string SimulatePath, string ModelPath, string ScalerPath);
        public record SimResponseDto(bool Success, string Message, List<int>? Predictions, List<double>? Probabilities);

        [HttpPost("simulate")]
        public async Task<ActionResult<SimResponseDto>> Simulate([FromBody] SimRequestDto req)
        {
            try
            {
                var sim = await _mlService.SimulateAsync(req.SimulatePath, req.ModelPath, req.ScalerPath);
                return Ok(new SimResponseDto(sim.Success, sim.Message, sim.Predictions, sim.Probabilities));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new SimResponseDto(false, ex.Message, null, null));
            }
        }
    }
}

