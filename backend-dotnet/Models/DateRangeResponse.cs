namespace Backend.Models
{
    public class DateRangeResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<PeriodSummary> Periods { get; set; } = new List<PeriodSummary>();
        public List<DailyData> DailyData { get; set; } = new List<DailyData>();
    }

    public class PeriodSummary
    {
        public string PeriodName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationInDays { get; set; }
        public int RecordCount { get; set; }
    }

    public class DailyData
    {
        public string Date { get; set; } = string.Empty; // yyyy-MM-dd
        public string Day { get; set; } = string.Empty;  // Jan 1
        public int Volume { get; set; }
        public string PeriodType { get; set; } = string.Empty; // Training/Testing/Simulation/''
    }
}
