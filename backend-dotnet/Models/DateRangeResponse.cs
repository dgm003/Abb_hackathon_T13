namespace Backend.Models
{
    public class DateRangeResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<PeriodSummary> Periods { get; set; } = new List<PeriodSummary>();
        public List<MonthlyData> MonthlyData { get; set; } = new List<MonthlyData>();
    }

    public class PeriodSummary
    {
        public string PeriodName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationInDays { get; set; }
        public int RecordCount { get; set; }
    }

    public class MonthlyData
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Volume { get; set; }
        public string PeriodType { get; set; } = string.Empty; // "Training", "Testing", "Simulation"
    }
}
