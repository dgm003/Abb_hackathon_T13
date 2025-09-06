# ML Service - Predictive Quality Control

A FastAPI-based machine learning service for predictive quality control in manufacturing, built for the ABB Hackathon T13.

## 🚀 Features

- **Structured Architecture**: Clean separation of concerns with service classes and dependency injection
- **Input Validation**: Comprehensive Pydantic models for request/response validation
- **Comprehensive Logging**: Detailed logging with file rotation and different log levels
- **Error Handling**: Proper error handling with meaningful error messages
- **Docker Support**: Production-ready Docker container with health checks
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

## 📁 Project Structure

```
ml-service-python/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── schemas.py              # Pydantic models
│   ├── dependencies.py         # Dependency injection
│   ├── logging_config.py       # Logging configuration
│   └── services/
│       ├── __init__.py
│       └── ml_service.py       # ML service class
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── test_service.py            # Test script
└── README.md                  # This file
```

## 🛠️ Installation

### Local Development

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the service**:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Docker Deployment

1. **Build the image**:
   ```bash
   docker build -t ml-service .
   ```

2. **Run the container**:
   ```bash
   docker run -p 8000:8000 ml-service
   ```

## 📚 API Endpoints

### Health & Status
- `GET /` - Root endpoint
- `GET /health` - Health check

### Data Management
- `POST /load-dataset` - Load dataset for processing
- `GET /data-summary` - Get dataset summary statistics

### Machine Learning
- `POST /train` - Train ML model with date ranges
- `POST /simulate` - Run prediction simulation

### Documentation
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## 🔧 Usage Examples

### Load Dataset
```python
import requests

# Load sample dataset
data = {
    "data": [
        {
            "data": {
                "synthetic_timestamp": "2021-01-01 00:00:00",
                "Response": 1,
                "feature1": 0.1,
                "feature2": 0.2,
                "feature3": 0.3
            }
        }
        # ... more records
    ]
}

response = requests.post("http://localhost:8000/load-dataset", json=data)
print(response.json())
```

### Train Model
```python
training_data = {
    "trainStart": "2021-01-01",
    "trainEnd": "2021-01-15",
    "testStart": "2021-01-16",
    "testEnd": "2021-01-20"
}

response = requests.post("http://localhost:8000/train", json=training_data)
print(response.json())
```

### Run Simulation
```python
simulation_data = {
    "simulationStart": "2021-01-21",
    "simulationEnd": "2021-01-25"
}

response = requests.post("http://localhost:8000/simulate", json=simulation_data)
print(response.json())
```

## 🧪 Testing

Run the test script to verify the service works correctly:

```bash
python test_service.py
```

The test script will:
1. Check service health
2. Test data summary endpoint
3. Load sample dataset
4. Train a model
5. Run simulation

## 📊 Logging

The service includes comprehensive logging:

- **Console Output**: INFO level and above
- **File Logging**: DEBUG level to `logs/ml_service.log`
- **Error Logging**: ERROR level to `logs/ml_service_errors.log`
- **Log Rotation**: 10MB max file size, 5 backup files

## 🔒 Security Features

- **Non-root User**: Docker container runs as non-root user
- **Input Validation**: All inputs validated using Pydantic models
- **Error Handling**: Proper error handling without exposing internal details
- **Health Checks**: Built-in health check endpoint

## 🚀 Performance

- **Efficient ML Models**: Uses XGBoost for optimal performance
- **Memory Management**: Proper cleanup and resource management
- **Async Support**: FastAPI's async capabilities for better concurrency
- **Docker Optimization**: Multi-stage builds and proper caching

## 📝 Development

### Adding New Features

1. **Add Pydantic Models**: Define in `schemas.py`
2. **Implement Service Logic**: Add methods to `MLService` class
3. **Create Endpoints**: Add routes in `main.py`
4. **Add Tests**: Update `test_service.py`

### Code Quality

- **Type Hints**: Full type annotation support
- **Documentation**: Comprehensive docstrings
- **Error Handling**: Proper exception handling
- **Logging**: Detailed logging throughout

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Kill process using port 8000
   lsof -ti:8000 | xargs kill -9
   ```

2. **Docker Build Fails**:
   ```bash
   # Clean Docker cache
   docker system prune -a
   ```

3. **Import Errors**:
   ```bash
   # Ensure PYTHONPATH is set
   export PYTHONPATH=/path/to/ml-service-python
   ```

### Logs

Check service logs for debugging:
```bash
# Docker logs
docker logs <container_name>

# Local logs
tail -f logs/ml_service.log
```

## 📄 License

Built for ABB Hackathon T13 - Predictive Quality Control

---

**Ready for production deployment!** 🚀
