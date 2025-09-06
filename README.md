# IntelliInspect - Predictive Quality Control

A full-stack AI-powered application for real-time quality control prediction using Kaggle Production Line sensor data.

## 🏗️ Architecture

- **Frontend**: Angular 17 with modern UI components
- **Backend**: .NET 8 Web API with C# 
- **ML Service**: Python 3.13 + FastAPI
- **Deployment**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)
- Python 3.13 (for local development)

### Running with Docker (Recommended)

1. **Clone and navigate to the project directory:**
   ```bash
   cd Abb_hackathon_T13
   ```

2. **Build and run all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080
   - ML Service: http://localhost:8000
   - Swagger UI: http://localhost:8080/swagger

### Running Locally (Development)

#### Backend (.NET 8)
```bash
cd backend-dotnet
dotnet restore
dotnet run
```

#### ML Service (Python)
```bash
cd ml-service-python
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Frontend (Angular)
```bash
cd frontend-angular
npm install
ng serve
```

## 📋 Features Implemented

### Screen 1: Upload Dataset ✅
- **Drag & Drop Interface**: Modern file upload with visual feedback
- **CSV Validation**: Ensures uploaded files are valid CSV format
- **Metadata Extraction**: 
  - Total records count
  - Column count
  - Pass rate calculation (% of Response = 1)
  - Date range (with synthetic timestamp generation)
  - File size display
- **Real-time Processing**: Backend processes files and returns metadata instantly
- **Responsive Design**: Works on desktop and mobile devices

### Backend Features
- **RESTful API**: Clean API endpoints for file upload and processing
- **CSV Parser Service**: Handles CSV file parsing and validation
- **File Service**: Manages file operations and validation
- **CORS Support**: Configured for frontend communication
- **Error Handling**: Comprehensive error handling and logging

### ML Service Features
- **Data Processing**: Handles CSV data processing and synthetic timestamp generation
- **Model Training**: XGBoost and LightGBM support for ML model training
- **FastAPI Integration**: Modern Python API with automatic documentation

## 🔧 API Endpoints

### Backend (.NET)
- `POST /api/data/upload` - Upload and process CSV files
- `GET /api/data/health` - Health check endpoint

### ML Service (Python)
- `POST /upload-file` - Upload files directly to ML service
- `POST /process-data` - Process CSV data with synthetic timestamps
- `POST /train-model` - Train ML models
- `GET /health` - Health check endpoint

## 📁 Project Structure

```
Abb_hackathon_T13/
├── backend-dotnet/          # .NET 8 Web API
│   ├── Controllers/         # API Controllers
│   ├── Models/             # Data Models
│   ├── Services/           # Business Logic
│   └── Program.cs          # Application Entry Point
├── frontend-angular/        # Angular 17 Frontend
│   ├── src/app/
│   │   ├── components/     # UI Components
│   │   └── services/       # API Services
│   └── package.json
├── ml-service-python/       # Python ML Service
│   ├── app/
│   │   ├── services/       # ML Services
│   │   └── main.py         # FastAPI App
│   └── requirements.txt
└── docker-compose.yaml     # Container Orchestration
```

## 🎯 Next Steps

The following screens are planned for future implementation:
- **Screen 2**: Date Ranges Configuration
- **Screen 3**: Model Training & Evaluation
- **Screen 4**: Real-Time Prediction Simulation

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 4200, 8080, and 8000 are available
2. **Docker Issues**: Try `docker-compose down` and `docker-compose up --build`
3. **CORS Errors**: Check that backend CORS is configured for frontend URL
4. **File Upload Issues**: Ensure CSV files have a 'Response' column

### Logs
- Backend logs: Check Docker container logs with `docker-compose logs backend-dotnet`
- ML Service logs: Check with `docker-compose logs ml-service-python`
- Frontend logs: Check browser console for errors

## 📝 Development Notes

- The application generates synthetic timestamps if not present in uploaded CSV files
- All services are configured for development with hot reloading
- CORS is configured to allow communication between services
- File uploads are temporarily stored in the `data/` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the ABB Hackathon and follows the hackathon guidelines.
