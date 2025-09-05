namespace Backend.Services
{
    public interface IFileService
    {
        Task<bool> ValidateFileAsync(IFormFile file);
        Task<string> GetFileExtensionAsync(string fileName);
    }

    public class FileService : IFileService
    {
        private readonly ILogger<FileService> _logger;
        private readonly long _maxFileSize;

        public FileService(ILogger<FileService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _maxFileSize = configuration.GetValue<long>("MaxFileSize", 100 * 1024 * 1024); // 100MB default
        }

        public async Task<bool> ValidateFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("File is null or empty");
                return false;
            }

            if (file.Length > _maxFileSize)
            {
                _logger.LogWarning("File size {FileSize} exceeds maximum allowed size {MaxSize}", 
                    file.Length, _maxFileSize);
                return false;
            }

            var extension = await GetFileExtensionAsync(file.FileName);
            if (!extension.Equals(".csv", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Invalid file extension: {Extension}", extension);
                return false;
            }

            return true;
        }

        public async Task<string> GetFileExtensionAsync(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return string.Empty;

            var lastDotIndex = fileName.LastIndexOf('.');
            if (lastDotIndex == -1 || lastDotIndex == fileName.Length - 1)
                return string.Empty;

            return fileName.Substring(lastDotIndex);
        }
    }
}
