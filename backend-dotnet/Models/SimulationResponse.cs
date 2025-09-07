namespace Backend.Models
{
    public class SimulationData
    {
        public string Time { get; set; } = string.Empty;
        public string SampleId { get; set; } = string.Empty;
        public string Prediction { get; set; } = string.Empty; // "Pass" or "Fail"
        public int Confidence { get; set; }
        public double Temperature { get; set; }
        public int Pressure { get; set; }
        public double Humidity { get; set; }
    }

    public class SimulationStartResponse
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
    }

    public class SimulationStats
    {
        public int Total { get; set; }
        public int Pass { get; set; }
        public int Fail { get; set; }
        public int AvgConfidence { get; set; }
    }
}
