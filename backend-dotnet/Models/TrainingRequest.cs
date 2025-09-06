namespace Backend.Models
{
    public class TrainingRequest
    {
        public string TrainStart { get; set; } = string.Empty;
        public string TrainEnd { get; set; } = string.Empty;
        public string TestStart { get; set; } = string.Empty;
        public string TestEnd { get; set; } = string.Empty;
    }
}
