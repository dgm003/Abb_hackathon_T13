# IntelliInspect - Predictive Quality Control

A full-stack AI-powered application for real-time quality control prediction using Kaggle Production Line sensor data. This application provides comprehensive data processing, machine learning model training, and real-time simulation capabilities.

## 🏗️ Architecture

- **Frontend**: Angular 17 with modern UI components and dark theme support
- **Backend**: .NET 8 Web API with C# and chunked CSV processing
- **ML Service**: Python 3.13 + FastAPI with XGBoost and LightGBM
- **Deployment**: Docker + Docker Compose with multi-service orchestration

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

## 📋 Complete Feature Set

### ✅ Screen 1: Data Upload & Processing
- **Modern Drag & Drop Interface**: Intuitive file upload with visual feedback
- **CSV Validation**: Comprehensive file format validation and error handling
- **Metadata Extraction**: 
  - Total records count with chunked processing for large files
  - Column count and data type analysis
  - Pass rate calculation (% of Response = 1)
  - Date range extraction with synthetic timestamp generation
  - File size display and validation
- **Upload History**: Complete history tracking with search and filtering
- **Real-time Processing**: Backend processes files and returns metadata instantly
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme Support**: Full dark/light theme toggle

### ✅ Screen 2: Date Ranges Configuration
- **Interactive Date Selection**: Training, testing, and simulation period configuration
- **Visual Timeline**: Interactive chart showing selected date ranges
- **Data Validation**: Ensures logical date ranges and data availability
- **Summary Statistics**: Real-time calculation of data distribution across periods
- **Dark Theme Integration**: Consistent theming across all components

### ✅ Screen 3: Model Training & Evaluation
- **Multiple ML Algorithms**: XGBoost, LightGBM, and Random Forest support
- **Real-time Training Metrics**: Live accuracy and loss curve visualization
- **Feature Importance Analysis**: Interactive charts showing top 10 most important features
- **Model Metadata Display**: 
  - Model ID and version tracking
  - Algorithm used and training parameters
  - Training samples and test samples count
  - Training time and performance metrics
- **Dynamic Updates**: All metrics and charts update on re-training
- **Export Capabilities**: Download training logs and model information

### ✅ Screen 4: Real-Time Prediction Simulation
- **Live Data Stream**: Real-time prediction simulation with IST timestamps
- **Interactive Controls**: Start, pause, resume, stop, and restart functionality
- **Dual Chart Visualization**:
  - Real-time quality predictions (0-100 range)
  - Prediction confidence donut chart
- **Live Statistics**: Total, pass, fail, and average confidence tracking
- **Sample ID Tracking**: Incrementing sample IDs (SAMPLE_001, SAMPLE_002, etc.)
- **Live Prediction Table**: Real-time table with all prediction details
- **Export Functionality**: Download simulation data and logs

## 🎨 UI/UX Features

### Theme System
- **Dark/Light Theme Toggle**: Global theme switching with persistent storage
- **Consistent Styling**: All screens adapt seamlessly to theme changes
- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive Layout**: Mobile-first design that works on all screen sizes

### Data Visualization
- **Plotly.js Integration**: Interactive charts with zoom, pan, and hover effects
- **Real-time Updates**: Charts update dynamically with new data
- **Export Capabilities**: Download charts and data in various formats
- **Responsive Charts**: Charts adapt to different screen sizes

## 🔧 Advanced Backend Features

### Performance Optimization
- **Chunked CSV Processing**: Handles large files (50MB+) efficiently
- **Memory Management**: Explicit garbage collection for large file processing
- **Async Processing**: Non-blocking file processing and API calls
- **Error Recovery**: Robust error handling and recovery mechanisms

### API Endpoints

#### Backend (.NET)
- `POST /api/data/upload` - Upload and process CSV files with chunked processing
- `GET /api/data/health` - Health check endpoint
- `POST /api/ml/train` - Train ML models with various algorithms
- `POST /api/simulation/start` - Start real-time simulation
- `GET /api/simulation/next` - Get next prediction data

#### ML Service (Python)
- `POST /upload-file` - Upload files directly to ML service
- `POST /process-data` - Process CSV data with synthetic timestamps
- `POST /train-model` - Train ML models with XGBoost/LightGBM
- `GET /health` - Health check endpoint

## 📁 Project Structure

```
Abb_hackathon_T13/
├── backend-dotnet/              # .NET 8 Web API
│   ├── Controllers/             # API Controllers
│   │   ├── DataController.cs    # File upload and processing
│   │   ├── MLController.cs      # ML model training
│   │   ├── SimulationController.cs # Real-time simulation
│   │   └── HealthController.cs  # Health checks
│   ├── Models/                  # Data Models
│   │   ├── DataSummary.cs       # Upload metadata
│   │   ├── TrainingRequest.cs   # ML training requests
│   │   └── SimulationResponse.cs # Simulation data
│   ├── Services/                # Business Logic
│   │   ├── CsvParserService.cs  # CSV processing with chunking
│   │   ├── MLService.cs         # ML model management
│   │   └── SimulationService.cs # Real-time simulation
│   └── Program.cs               # Application Entry Point
├── frontend-angular/            # Angular 17 Frontend
│   ├── src/app/
│   │   ├── components/          # UI Components
│   │   │   ├── upload/          # Data upload screen
│   │   │   ├── date-ranges/     # Date configuration
│   │   │   ├── model-training/  # ML training interface
│   │   │   ├── simulation/      # Real-time simulation
│   │   │   └── upload-history/  # Upload history management
│   │   ├── services/            # API Services
│   │   │   ├── data.service.ts  # Data upload service
│   │   │   ├── ml.service.ts    # ML training service
│   │   │   ├── simulation.service.ts # Simulation service
│   │   │   └── theme.service.ts # Theme management
│   │   └── app.routes.ts        # Application routing
│   └── package.json
├── ml-service-python/           # Python ML Service
│   ├── app/
│   │   ├── services/            # ML Services
│   │   │   ├── data_processor.py # Data processing
│   │   │   └── ml_model.py      # ML model training
│   │   ├── main.py              # FastAPI App
│   │   └── schemas.py           # Data schemas
│   └── requirements.txt
├── data/                        # Data storage
│   └── preprocessed/            # Processed CSV files
├── docs/                        # Documentation
│   └── architecture.md          # System architecture
└── docker-compose.yaml          # Container Orchestration
```

## 🎯 Submission Checklist Status

### ✅ Must Have Features (100% Complete)
- [x] **Data Upload & Processing**: Complete with chunked processing
- [x] **Date Range Configuration**: Interactive date selection
- [x] **Model Training**: Multiple algorithms with real-time metrics
- [x] **Real-time Simulation**: Live prediction stream with controls
- [x] **Export Functionality**: Download logs and data
- [x] **Documentation**: Complete README and architecture docs

### ✅ Good to Have Features (100% Complete)
- [x] **Feature Importance Visualization**: Interactive charts
- [x] **Live Chart for Streaming Predictions**: Real-time updates
- [x] **Retry/Resume Simulation Logic**: Pause/resume/stop controls
- [x] **Model Versioning and Metadata Display**: Complete model info

### ✅ Nice to Have Features (100% Complete)
- [x] **Upload History**: Complete history management with search
- [x] **Theme Toggle**: Dark/light theme with persistent storage
- [x] **Performance Optimization**: Chunked processing for large files
- [x] **Export Logs**: Comprehensive logging and export capabilities

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 4200, 8080, and 8000 are available
2. **Docker Issues**: Try `docker-compose down` and `docker-compose up --build`
3. **CORS Errors**: Check that backend CORS is configured for frontend URL
4. **File Upload Issues**: Ensure CSV files have a 'Response' column
5. **Theme Issues**: Clear browser cache if theme toggle doesn't work
6. **Simulation Issues**: Check browser console for JavaScript errors

### Performance Tips

1. **Large Files**: The system automatically uses chunked processing for files >50MB
2. **Memory Usage**: Monitor Docker container memory usage for large datasets
3. **Browser Performance**: Close unnecessary browser tabs during simulation

### Logs
- Backend logs: `docker-compose logs backend-dotnet`
- ML Service logs: `docker-compose logs ml-service-python`
- Frontend logs: Check browser console for errors
- All services: `docker-compose logs`

## 📝 Development Notes

- The application generates synthetic timestamps if not present in uploaded CSV files
- All services are configured for development with hot reloading
- CORS is configured to allow communication between services
- File uploads are temporarily stored in the `data/` directory
- Theme preferences are stored in browser localStorage
- Upload history is persisted in browser localStorage

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Configure proper CORS settings
3. Set up proper file storage (not local directory)
4. Configure logging and monitoring
5. Set up SSL certificates for HTTPS

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## 📄 License

This project is part of the ABB Hackathon and follows the hackathon guidelines.

## 🏆 Acknowledgments

- **ABB Hackathon Team**: For providing the challenge and dataset
- **Kaggle**: For the Bosch Production Line Performance dataset
- **Open Source Community**: For the amazing tools and libraries used

---

**Built with ❤️ for ABB Hackathon 2024**