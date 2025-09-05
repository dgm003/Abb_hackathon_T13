namespace Backend.Models
{
    public class DataSummary
    {
        public string FileName { get; set; } = string.Empty;
        public long TotalRecords { get; set; }
        public int TotalColumns { get; set; }
        public double PassRate { get; set; }
        public DateTime EarliestTimestamp { get; set; }
        public DateTime LatestTimestamp { get; set; }
        public string FileSize { get; set; } = string.Empty;
    }

    public class FileUploadResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public DataSummary? DataSummary { get; set; }
    }

    public class FileUploadRequest
    {
        public IFormFile File { get; set; } = null!;
    }
}
