namespace Backend.Models
{
    public class TrainResponse
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public TrainMetrics Metrics { get; set; } = new TrainMetrics();
    }

    public class TrainMetrics
    {
        public double Accuracy { get; set; }
        public double Precision { get; set; }
        public double Recall { get; set; }
        public double F1 { get; set; }
        public List<double> LossCurve { get; set; } = new();
        public List<double> AccCurve { get; set; } = new();
        public Confusion Confusion { get; set; } = new();
    }

    public class Confusion
    {
        public int Tp { get; set; }
        public int Tn { get; set; }
        public int Fp { get; set; }
        public int Fn { get; set; }
    }
}
