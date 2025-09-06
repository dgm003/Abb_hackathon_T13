using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class DateRangeRequest
    {
        [Required]
        public DateTime TrainingStart { get; set; }
        
        [Required]
        public DateTime TrainingEnd { get; set; }
        
        [Required]
        public DateTime TestingStart { get; set; }
        
        [Required]
        public DateTime TestingEnd { get; set; }
        
        [Required]
        public DateTime SimulationStart { get; set; }
        
        [Required]
        public DateTime SimulationEnd { get; set; }
    }
}
