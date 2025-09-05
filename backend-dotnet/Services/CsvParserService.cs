using Backend.Models;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace Backend.Services
{
    public interface ICsvParserService
    {
        Task<DataSummary> ParseCsvFileAsync(IFormFile file);
        Task<string> SaveFileAsync(IFormFile file);
        Task<string> SavePreprocessedDataAsync(List<Dictionary<string, object>> records, string originalFileName);
    }

    public class CsvParserService : ICsvParserService
    {
        private readonly IFileService _fileService;
        private readonly string _dataDirectory;

        public CsvParserService(IFileService fileService, IConfiguration configuration)
        {
            _fileService = fileService;
            _dataDirectory = configuration["DataDirectory"] ?? "data";
        }

        public async Task<DataSummary> ParseCsvFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null");

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("File must be a CSV file");

            // Save file first
            var filePath = await SaveFileAsync(file);

            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null
            });

            var records = new List<Dictionary<string, object>>();
            var headers = new List<string>();

            // Read headers
            await csv.ReadAsync();
            csv.ReadHeader();
            headers = csv.HeaderRecord?.ToList() ?? new List<string>();

            if (!headers.Contains("Response"))
                throw new ArgumentException("CSV file must contain a 'Response' column");

            // Read all records and add synthetic timestamps
            var recordIndex = 0;
            while (await csv.ReadAsync())
            {
                var record = new Dictionary<string, object>();
                foreach (var header in headers)
                {
                    record[header] = csv.GetField(header) ?? string.Empty;
                }
                
                // Add synthetic timestamp column (always add for consistency)
                var syntheticTimestamp = new DateTime(2021, 1, 1, 0, 0, 0).AddSeconds(recordIndex);
                record["synthetic_timestamp"] = syntheticTimestamp.ToString("yyyy-MM-dd HH:mm:ss");
                
                records.Add(record);
                recordIndex++;
            }

            // Calculate metadata
            var totalRecords = records.Count;
            var totalColumns = headers.Count + 1; // +1 for synthetic_timestamp column
            var passCount = records.Count(r => r.ContainsKey("Response") && 
                int.TryParse(r["Response"].ToString(), out int response) && response == 1);
            var passRate = totalRecords > 0 ? (double)passCount / totalRecords * 100 : 0;

            // Always generate synthetic timestamps for consistent processing
            // According to requirements: start timestamp = 2021-01-01 00:00:00, increment 1 second per row
            var startDate = new DateTime(2021, 1, 1, 0, 0, 0);
            var earliestTimestamp = startDate;
            var latestTimestamp = startDate.AddSeconds(totalRecords - 1);

            // Save preprocessed dataset for next steps (training, simulation)
            var preprocessedFilePath = await SavePreprocessedDataAsync(records, file.FileName);

            return new DataSummary
            {
                FileName = file.FileName,
                TotalRecords = totalRecords,
                TotalColumns = totalColumns,
                PassRate = Math.Round(passRate, 2),
                EarliestTimestamp = earliestTimestamp,
                LatestTimestamp = latestTimestamp,
                FileSize = FormatFileSize(file.Length)
            };
        }

        public async Task<string> SaveFileAsync(IFormFile file)
        {
            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(_dataDirectory, fileName);

            // Ensure directory exists
            Directory.CreateDirectory(_dataDirectory);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return filePath;
        }

        public async Task<string> SavePreprocessedDataAsync(List<Dictionary<string, object>> records, string originalFileName)
        {
            if (!records.Any())
                throw new ArgumentException("No records to save");

            // Create preprocessed directory
            var preprocessedDir = Path.Combine(_dataDirectory, "preprocessed");
            Directory.CreateDirectory(preprocessedDir);

            // Generate filename for preprocessed data
            var baseName = Path.GetFileNameWithoutExtension(originalFileName);
            var preprocessedFileName = $"{baseName}_preprocessed.csv";
            var preprocessedFilePath = Path.Combine(preprocessedDir, preprocessedFileName);

            // Get all unique column names from all records
            var allColumns = records.SelectMany(r => r.Keys).Distinct().ToList();

            // Write preprocessed CSV
            using var writer = new StreamWriter(preprocessedFilePath);
            using var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true
            });

            // Write headers
            foreach (var column in allColumns)
            {
                csv.WriteField(column);
            }
            await csv.NextRecordAsync();

            // Write records
            foreach (var record in records)
            {
                foreach (var column in allColumns)
                {
                    var value = record.ContainsKey(column) ? record[column]?.ToString() ?? "" : "";
                    csv.WriteField(value);
                }
                await csv.NextRecordAsync();
            }

            return preprocessedFilePath;
        }

        private static string FormatFileSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }
}
