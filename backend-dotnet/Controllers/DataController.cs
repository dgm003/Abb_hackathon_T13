using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using CsvHelper;
using System.Globalization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<DataController> _logger;
        private static List<Dictionary<string, object>> _storedDataset = new List<Dictionary<string, object>>();

        public DataController(HttpClient httpClient, ILogger<DataController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest("Only CSV files are allowed");
                }

                using var reader = new StreamReader(file.OpenReadStream());
                using var csv = new CsvHelper.CsvReader(reader, CultureInfo.InvariantCulture);
                
                var records = new List<Dictionary<string, object>>();
                var headers = new List<string>();
                
                // Read headers
                csv.Read();
                csv.ReadHeader();
                headers = csv.HeaderRecord?.ToList() ?? new List<string>();

                // Validate that Response column exists
                if (!headers.Contains("Response", StringComparer.OrdinalIgnoreCase))
                {
                    return BadRequest("CSV must contain a 'Response' column");
                }

                // Read all records
                while (csv.Read())
                {
                    var record = new Dictionary<string, object>();
                    foreach (var header in headers)
                    {
                        record[header] = csv.GetField(header) ?? "";
                    }
                    records.Add(record);
                }

                // Generate synthetic timestamps if not present
                var startDate = new DateTime(2021, 1, 1);
                for (int i = 0; i < records.Count; i++)
                {
                    if (!records[i].ContainsKey("Timestamp") || string.IsNullOrEmpty(records[i]["Timestamp"]?.ToString()))
                    {
                        var syntheticTimestamp = startDate.AddSeconds(i);
                        records[i]["Timestamp"] = syntheticTimestamp.ToString("yyyy-MM-dd HH:mm:ss");
                        records[i]["synthetic_timestamp"] = syntheticTimestamp.ToString("yyyy-MM-dd HH:mm:ss");
                    }
                    else
                    {
                        // If timestamp exists, also add synthetic_timestamp for ML service
                        records[i]["synthetic_timestamp"] = records[i]["Timestamp"];
                    }
                }

                // Calculate metadata
                var totalRecords = records.Count;
                var totalColumns = headers.Count;
                var responseColumn = headers.FirstOrDefault(h => h.Equals("Response", StringComparison.OrdinalIgnoreCase));
                var passCount = 0;
                
                if (responseColumn != null)
                {
                    passCount = records.Count(r => 
                        r.ContainsKey(responseColumn) && 
                        (r[responseColumn]?.ToString() == "1" || r[responseColumn]?.ToString()?.ToLower() == "true" || r[responseColumn]?.ToString()?.ToLower() == "pass"));
                }

                var passRate = totalRecords > 0 ? Math.Round((double)passCount / totalRecords * 100, 1) : 0;
                var firstTimestamp = startDate;
                var lastTimestamp = startDate.AddSeconds(totalRecords - 1);
                var dateRange = $"{firstTimestamp:yyyy-MM-dd} to {lastTimestamp:yyyy-MM-dd}";

                // Store the dataset for ML processing
                _storedDataset = records;

                var metadata = new
                {
                    totalRecords,
                    totalColumns,
                    passRate,
                    dateRange,
                    fileName = file.FileName,
                    firstTimestamp = firstTimestamp.ToString("yyyy-MM-dd HH:mm:ss"),
                    lastTimestamp = lastTimestamp.ToString("yyyy-MM-dd HH:mm:ss")
                };

                return Ok(metadata);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing uploaded file");
                return StatusCode(500, "Error processing file");
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDataSummary()
        {
            try
            {
                // Call ML service to get data summary
                var response = await _httpClient.GetAsync("http://ml-service-python:8000/data-summary");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Ok(JsonSerializer.Deserialize<object>(content));
                }
                return BadRequest("Failed to get data summary from ML service");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data summary");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessData([FromBody] object data)
        {
            try
            {
                // Send data to ML service for processing
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("http://ml-service-python:8000/process-data", content);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(JsonSerializer.Deserialize<object>(result));
                }
                return BadRequest("Failed to process data");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing data");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", message = "Backend service is running", timestamp = DateTime.UtcNow });
        }

        [HttpPost("send-dataset")]
        public async Task<IActionResult> SendDatasetToML()
        {
            try
            {
                if (_storedDataset.Count == 0)
                {
                    return BadRequest("No dataset available to send");
                }

                var json = JsonSerializer.Serialize(_storedDataset);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("http://ml-service-python:8000/load-dataset", content);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    return Ok(JsonSerializer.Deserialize<object>(result));
                }
                return BadRequest("Failed to send dataset to ML service");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending dataset to ML service");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
