using Backend.Models;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace Backend.Services
{
    public interface ICsvParserService
    {
        Task<DataSummary> ParseCsvStreamAsync(Stream fileStream, string fileName, long fileSize);
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

            public async Task<DataSummary> ParseCsvStreamAsync(Stream fileStream, string fileName, long fileSize)
    {
        if (fileStream == null || fileSize == 0)
            throw new ArgumentException("File stream is empty or null");

        if (!fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("File must be a CSV file");

        int totalRecords = 0;
        int passCount = 0;
        List<string> headers = null;
        var startDate = new DateTime(2021, 1, 1, 0, 0, 0);

        // Prepare preprocessed file for streaming write
        var preprocessedDir = Path.Combine(_dataDirectory, "preprocessed");
        Directory.CreateDirectory(preprocessedDir);
        var baseName = Path.GetFileNameWithoutExtension(fileName);
        var preprocessedFileName = $"{baseName}_preprocessed.csv";
        var preprocessedFilePath = Path.Combine(preprocessedDir, preprocessedFileName);

        using var reader = new StreamReader(fileStream);
        using var csvReader = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null
        });
        using var writer = new StreamWriter(preprocessedFilePath);
        using var csvWriter = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true
        });

        await csvReader.ReadAsync();
        csvReader.ReadHeader();
        headers = csvReader.HeaderRecord?.ToList() ?? new List<string>();

        if (!headers.Contains("Response"))
            throw new ArgumentException("CSV file must contain a 'Response' column");

        // Write headers + synthetic_timestamp
        foreach (var column in headers)
            csvWriter.WriteField(column);
        csvWriter.WriteField("synthetic_timestamp");
        await csvWriter.NextRecordAsync();

        int recordIndex = 0;
        while (await csvReader.ReadAsync())
        {
            var record = new Dictionary<string, object>();
            foreach (var header in headers)
            {
                record[header] = csvReader.GetField(header) ?? string.Empty;
            }
            var syntheticTimestamp = startDate.AddSeconds(recordIndex).ToString("yyyy-MM-dd HH:mm:ss");
            record["synthetic_timestamp"] = syntheticTimestamp;

            // Write record
            foreach (var column in headers)
                csvWriter.WriteField(record[column]);
            csvWriter.WriteField(record["synthetic_timestamp"]);
            await csvWriter.NextRecordAsync();

            // Count pass rate
            if (record.ContainsKey("Response") &&
                int.TryParse(record["Response"]?.ToString(), out int response) && response == 1)
            {
                passCount++;
            }
            totalRecords++;
            recordIndex++;
        }

        var totalColumns = headers.Count + 1;
        var passRate = totalRecords > 0 ? (double)passCount / totalRecords * 100 : 0;
        var earliestTimestamp = startDate;
        var latestTimestamp = startDate.AddSeconds(totalRecords - 1);

        return new DataSummary
        {
            FileName = fileName,
            TotalRecords = totalRecords,
            TotalColumns = totalColumns,
            PassRate = Math.Round(passRate, 2),
            EarliestTimestamp = earliestTimestamp,
            LatestTimestamp = latestTimestamp,
            FileSize = FormatFileSize(fileSize)
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
