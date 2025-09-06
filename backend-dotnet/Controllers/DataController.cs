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

        // ...existing code...
[RequestSizeLimit(5L * 1024 * 1024 * 1024)] // 5 GB
[HttpPost("upload")]
public async Task<ActionResult<FileUploadResponse>> UploadFile([FromForm] FileUploadRequest request)
{
    try
    {
        _logger.LogInformation("File upload request received: {FileName}", request.File?.FileName);

        if (!await _fileService.ValidateFileAsync(request.File))
        {
            return BadRequest(new FileUploadResponse
            {
                Success = false,
                Message = "Invalid file. Please upload a valid CSV file."
            });
        }

        // Stream the file directly to the parser
        using var fileStream = request.File.OpenReadStream();
        var dataSummary = await _csvParserService.ParseCsvStreamAsync(fileStream, request.File.FileName, request.File.Length);

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
// ...existing code...

        [HttpGet("health")]
        public ActionResult GetHealth()
        {
            return Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow });
        }
    }
}
