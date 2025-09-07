using System.Net.Http.Json;
using System.Text.Json;

namespace Backend.Services
{
    public interface IMLService
    {
        Task<TrainResult> TrainAsync(string filePath, string targetColumn = "Response", string modelType = "xgboost");
        Task<TestResult> TestAsync(string filePath, string targetColumn, string modelPath, string scalerPath);
        Task<SimulateResult> SimulateAsync(string filePath, string modelPath, string scalerPath);
    }

    public class MLService : IMLService
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerOptions _jsonOptions;

        public MLService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            };
        }

        private static async Task<HttpResponseMessage> SendWithRetry(Func<Task<HttpResponseMessage>> sendAsync)
        {
            Exception? lastError = null;
            for (int attempt = 1; attempt <= 5; attempt++)
            {
                try
                {
                    var response = await sendAsync();
                    if (response.IsSuccessStatusCode)
                    {
                        return response;
                    }
                }
                catch (Exception ex)
                {
                    lastError = ex;
                }
                await Task.Delay(TimeSpan.FromSeconds(1));
            }
            throw lastError ?? new HttpRequestException("Unknown error while contacting ML service");
        }

        public async Task<TrainResult> TrainAsync(string filePath, string targetColumn = "Response", string modelType = "xgboost")
        {
            var payload = new { file_path = filePath, target_column = targetColumn, model_type = modelType };
            try
            {
                var response = await SendWithRetry(() => _httpClient.PostAsJsonAsync("/train", payload));
                var result = await response.Content.ReadFromJsonAsync<TrainResult>(_jsonOptions);
                return result!;
            }
            catch (Exception)
            {
                using var fallback = new HttpClient { BaseAddress = new Uri("http://host.docker.internal:8000") };
                var response = await SendWithRetry(() => fallback.PostAsJsonAsync("/train", payload));
                var result = await response.Content.ReadFromJsonAsync<TrainResult>(_jsonOptions);
                return result!;
            }
        }

        public async Task<TestResult> TestAsync(string filePath, string targetColumn, string modelPath, string scalerPath)
        {
            var payload = new { file_path = filePath, target_column = targetColumn, model_path = modelPath, scaler_path = scalerPath };
            try
            {
                var response = await SendWithRetry(() => _httpClient.PostAsJsonAsync("/test", payload));
                var result = await response.Content.ReadFromJsonAsync<TestResult>(_jsonOptions);
                return result!;
            }
            catch (Exception)
            {
                using var fallback = new HttpClient { BaseAddress = new Uri("http://host.docker.internal:8000") };
                var response = await SendWithRetry(() => fallback.PostAsJsonAsync("/test", payload));
                var result = await response.Content.ReadFromJsonAsync<TestResult>(_jsonOptions);
                return result!;
            }
        }

        public async Task<SimulateResult> SimulateAsync(string filePath, string modelPath, string scalerPath)
        {
            var payload = new { file_path = filePath, model_path = modelPath, scaler_path = scalerPath };
            try
            {
                var response = await SendWithRetry(() => _httpClient.PostAsJsonAsync("/simulate", payload));
                var result = await response.Content.ReadFromJsonAsync<SimulateResult>(_jsonOptions);
                return result!;
            }
            catch (Exception)
            {
                using var fallback = new HttpClient { BaseAddress = new Uri("http://host.docker.internal:8000") };
                var response = await SendWithRetry(() => fallback.PostAsJsonAsync("/simulate", payload));
                var result = await response.Content.ReadFromJsonAsync<SimulateResult>(_jsonOptions);
                return result!;
            }
        }
    }

    public record TrainResult(bool Success, string Message, Dictionary<string, object>? Metrics, string? model_path, string? scaler_path, List<string>? feature_columns)
    {
        public string? ModelPath => model_path;
        public string? ScalerPath => scaler_path;
        public List<string>? FeatureColumns => feature_columns;
    }
    public record TestResult(bool Success, string Message, Dictionary<string, object>? Metrics);
    public record SimulateResult(bool Success, string Message, List<int>? Predictions, List<double>? Probabilities);
}

