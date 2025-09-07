using Backend.Models;
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

        [HttpPost("train")]
        public async Task<ActionResult<TrainResponse>> Train()
        {
            var result = await _mlService.TrainAsync();
            return Ok(result);
        }
    }
}
