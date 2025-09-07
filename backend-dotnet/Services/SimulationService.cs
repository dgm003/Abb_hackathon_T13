using Backend.Models;
using System.Net.Http.Json;

namespace Backend.Services
{
    public interface ISimulationService
    {
        Task<SimulationStartResponse> StartSimulationAsync();
        Task<SimulationData?> GetNextPredictionAsync();
        Task<SimulationStats> GetSimulationStatsAsync();
    }

    public class SimulationService : ISimulationService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _config;
        private int _currentSample = 0;
        private readonly int _maxSamples = 20;
        private readonly List<SimulationData> _predictions = new();

        public SimulationService(IConfiguration config)
        {
            _config = config;
            _http = new HttpClient();
        }

        public async Task<SimulationStartResponse> StartSimulationAsync()
        {
            var mlUrl = _config["MLService:BaseUrl"] ?? "http://ml-service-python:8000";
            try
            {
                var resp = await _http.PostAsync($"{mlUrl}/start-simulation", null);
                if (!resp.IsSuccessStatusCode)
                {
                    return new SimulationStartResponse 
                    { 
                        Success = true, 
                        Message = "Simulation started with mock data" 
                    };
                }

                var result = await resp.Content.ReadFromJsonAsync<SimulationStartResponse>();
                return result ?? new SimulationStartResponse { Success = true, Message = "Simulation started" };
            }
            catch (Exception ex)
            {
                return new SimulationStartResponse 
                { 
                    Success = true, 
                    Message = $"Simulation started with mock data: {ex.Message}" 
                };
            }
        }

        public async Task<SimulationData?> GetNextPredictionAsync()
        {
            if (_currentSample >= _maxSamples)
            {
                return null; // Simulation complete
            }

            var mlUrl = _config["MLService:BaseUrl"] ?? "http://ml-service-python:8000";
            try
            {
                var resp = await _http.GetAsync($"{mlUrl}/next-prediction");
                if (resp.IsSuccessStatusCode)
                {
                    var result = await resp.Content.ReadFromJsonAsync<SimulationData>();
                    if (result != null)
                    {
                        _predictions.Add(result);
                        _currentSample++;
                        return result;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ML service call failed: {ex.Message}");
            }

            // Fallback to mock data
            return GetMockPrediction();
        }

        public async Task<SimulationStats> GetSimulationStatsAsync()
        {
            var total = _predictions.Count;
            var pass = _predictions.Count(p => p.Prediction == "Pass");
            var fail = _predictions.Count(p => p.Prediction == "Fail");
            var avgConfidence = total > 0 ? (int)_predictions.Average(p => p.Confidence) : 0;

            return new SimulationStats
            {
                Total = total,
                Pass = pass,
                Fail = fail,
                AvgConfidence = avgConfidence
            };
        }

        private SimulationData GetMockPrediction()
        {
            var now = DateTime.Now;
            var time = now.ToString("HH:mm:ss");
            var sampleId = $"SAMPLE_{(_currentSample + 1):D3}";

            // Generate realistic sensor data
            var random = new Random();
            var temperature = 20 + random.NextDouble() * 15; // 20-35°C
            var pressure = 1000 + random.Next(0, 51); // 1000-1050 hPa
            var humidity = 40 + random.NextDouble() * 40; // 40-80%

            // Generate prediction based on sensor values (simple logic)
            var qualityScore = (temperature < 30 ? 0.8 : 0.6) +
                             (pressure > 1020 ? 0.1 : 0) +
                             (humidity < 70 ? 0.1 : 0) +
                             (random.NextDouble() * 0.2);

            var prediction = qualityScore > 0.7 ? "Pass" : "Fail";
            var confidence = (int)(qualityScore * 100);

            _currentSample++;

            var result = new SimulationData
            {
                Time = time,
                SampleId = sampleId,
                Prediction = prediction,
                Confidence = confidence,
                Temperature = Math.Round(temperature, 1),
                Pressure = pressure,
                Humidity = Math.Round(humidity, 1)
            };

            _predictions.Add(result);
            return result;
        }
    }
}
