using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {
        private readonly ICsvParserService _csvParserService;
        private readonly IFileService _fileService;
        private readonly ILogger<DataController> _logger;

        public DataController(
            ICsvParserService csvParserService,
            IFileService fileService,
            ILogger<DataController> logger)
        {
            _csvParserService = csvParserService;
            _fileService = fileService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<FileUploadResponse>> UploadFile([FromForm] FileUploadRequest request)
        {
            try
            {
                _logger.LogInformation("File upload request received: {FileName}", request.File?.FileName);

                // Validate file
                if (!await _fileService.ValidateFileAsync(request.File))
                {
                    return BadRequest(new FileUploadResponse
                    {
                        Success = false,
                        Message = "Invalid file. Please upload a valid CSV file."
                    });
                }

                // Parse CSV and extract metadata
                var dataSummary = await _csvParserService.ParseCsvFileAsync(request.File);

                _logger.LogInformation("File processed successfully: {FileName}, Records: {Records}", 
                    dataSummary.FileName, dataSummary.TotalRecords);

                return Ok(new FileUploadResponse
                {
                    Success = true,
                    Message = "File uploaded and processed successfully",
                    DataSummary = dataSummary
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Invalid file format: {Message}", ex.Message);
                return BadRequest(new FileUploadResponse
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing file upload");
                return StatusCode(500, new FileUploadResponse
                {
                    Success = false,
                    Message = "An error occurred while processing the file"
                });
            }
        }

        [HttpGet("health")]
        public ActionResult GetHealth()
        {
            return Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
        }
    }
}
