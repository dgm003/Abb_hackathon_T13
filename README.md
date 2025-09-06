# IntelliInspect: Real-Time Predictive Quality Control

A full-stack AI-powered application for predictive quality control in manufacturing, built for the ABB Hackathon T13.

## 🏆 Must-Have Deliverables

### ✅ Dataset Handling
- **CSV Upload**: Drag-and-drop interface for Bosch Kaggle CSV files
- **Validation**: Backend parses and validates CSV structure
- **Synthetic Timestamps**: Automatically adds 1-second increment timestamps if missing
- **Metadata Display**: Shows total records, columns, pass rate, and date range
- **UI Integration**: Metadata displayed before proceeding to next step

### ✅ Date Range Selection
- **Calendar Pickers**: Interactive date pickers for Training/Testing/Simulation periods
- **Validation Logic**: Ensures sequential, non-overlapping date ranges
- **Dataset Bounds**: Validates all dates are within dataset timestamp range
- **Visualization**: Timeline summary with period counts and visualization

### ✅ Model Training & Evaluation
- **ML Integration**: Python FastAPI service with XGBoost/LightGBM/sklearn
- **Training Trigger**: Backend API calls to Python ML service
- **Metrics Display**: Accuracy, Precision, Recall, F1-Score cards
- **Charts**: Training loss/accuracy and confusion matrix visualizations
- **Real-time Updates**: Live training progress and results

### ✅ Real-Time Prediction Simulation
- **Streaming Simulation**: Row-by-row processing from Simulation period (1/sec)
- **Live Charts**: Quality scores over time (line chart)
- **Confidence Distribution**: Donut chart showing prediction confidence
- **Counters**: Total predictions, pass/fail counts, average confidence
- **Live Table**: Timestamp, sample ID, prediction, confidence, parameters

### ✅ Docker Deployment
- **Multi-Service Architecture**: Angular frontend, .NET backend, Python ML service
- **Docker Compose**: Single command deployment with `docker-compose up`
- **Complete Repository**: All source code, configuration, and documentation included

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git (for cloning the repository)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Abb_hackathon_T13
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:8080
   - **ML Service**: http://localhost:8000

### Usage Instructions

#### Step 1: Upload Dataset
1. Open http://localhost:4200 in your browser
2. Drag and drop a CSV file or click "Choose File"
3. Ensure the CSV contains a "Response" column
4. Wait for processing and metadata display
5. Click "Next" to proceed

#### Step 2: Configure Date Ranges
1. Set Training Period start and end dates
2. Set Testing Period start and end dates  
3. Set Simulation Period start and end dates
4. Click "Validate Ranges" to verify:
   - Sequential order (Training → Testing → Simulation)
   - Non-overlapping periods
   - All dates within dataset range
5. Click "Next" when validation passes

#### Step 3: Train Model
1. Click "Train Model" to start training
2. Wait for training to complete
3. View evaluation metrics:
   - Accuracy
   - Precision
   - Recall
   - F1-Score
4. Click "Next" to proceed to simulation

#### Step 4: Run Simulation
1. Click "Start Simulation" to begin real-time prediction
2. Watch live updates:
   - Quality scores over time
   - Prediction confidence distribution
   - Pass/fail counters
   - Sample data table
3. Click "Restart Simulation" to run again

## 🏗️ Architecture

### Frontend (Angular)
- **Framework**: Angular 18+
- **Port**: 4200
- **Features**: Drag-and-drop, date pickers, real-time charts, responsive design
- **Location**: `frontend-angular/`

### Backend (.NET)
- **Framework**: ASP.NET Core 8
- **Port**: 8080
- **Features**: CSV parsing, API endpoints, CORS configuration
- **Location**: `backend-dotnet/`

### ML Service (Python)
- **Framework**: FastAPI
- **Port**: 8000
- **Features**: XGBoost training, real-time prediction, metrics calculation
- **Location**: `ml-service-python/`

### Docker Configuration
- **Orchestration**: Docker Compose
- **Network**: Custom bridge network for inter-service communication
- **File**: `docker-compose.yaml`

## 📁 Project Structure

```
Abb_hackathon_T13/
├── frontend-angular/          # Angular frontend application
│   ├── src/app/
│   │   ├── app.component.html # Main UI components
│   │   ├── app.component.ts   # Component logic
│   │   └── app.component.css  # Styling
│   ├── Dockerfile
│   └── package.json
├── backend-dotnet/            # .NET backend API
│   ├── Controllers/
│   │   ├── DataController.cs  # Data upload & processing
│   │   ├── MLController.cs    # ML training endpoints
│   │   └── SimulationController.cs # Simulation endpoints
│   ├── Models/
│   │   ├── TrainingRequest.cs
│   │   └── SimulationRequest.cs
│   ├── Dockerfile
│   └── Backend.csproj
├── ml-service-python/         # Python ML service
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   └── services/         # ML processing logic
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yaml        # Multi-service orchestration
└── README.md                  # This file
```

## 🔧 API Endpoints

### Backend (.NET) - Port 8080
- `GET /api/data/health` - Health check
- `POST /api/data/upload` - Upload CSV file
- `POST /api/data/send-dataset` - Send dataset to ML service
- `POST /api/ml/train` - Train ML model
- `POST /api/simulation/start` - Start prediction simulation

### ML Service (Python) - Port 8000
- `GET /health` - Health check
- `POST /load-dataset` - Load dataset for processing
- `POST /train` - Train XGBoost model
- `POST /simulate` - Run prediction simulation
- `GET /data-summary` - Get dataset summary

## 🐛 Troubleshooting

### Common Issues

1. **Docker not starting**
   - Ensure Docker Desktop is running
   - Check available disk space
   - Restart Docker Desktop if needed

2. **Port conflicts**
   - Ensure ports 4200, 8080, and 8000 are available
   - Stop other services using these ports

3. **CSV upload issues**
   - Ensure CSV has a "Response" column
   - Check file size (should be reasonable for processing)
   - Verify CSV format is valid

4. **Date validation errors**
   - Ensure dates are in correct format (YYYY-MM-DD)
   - Check that periods are sequential and non-overlapping
   - Verify dates are within dataset range

### Logs
View container logs for debugging:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend-angular
docker-compose logs backend-dotnet
docker-compose logs ml-service-python
```

## 🎯 Features Implemented

- ✅ **Complete UI/UX**: All 4 screens with proper navigation
- ✅ **Drag-and-Drop Upload**: CSV file handling with validation
- ✅ **Synthetic Timestamps**: Automatic timestamp generation
- ✅ **Date Range Validation**: Sequential, non-overlapping validation
- ✅ **ML Model Training**: XGBoost with comprehensive metrics
- ✅ **Real-Time Simulation**: Streaming predictions with live updates
- ✅ **Docker Deployment**: Complete containerized solution
- ✅ **API Integration**: Full frontend-backend-ML service communication
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Responsive Design**: Mobile-friendly interface

## 🏆 Hackathon Submission

This application fully meets all the **Must-Have Deliverables** requirements:

1. **Dataset Handling** ✅ - Complete CSV processing with metadata
2. **Date Range Selection** ✅ - Calendar pickers with validation
3. **Model Training & Evaluation** ✅ - XGBoost with metrics and charts
4. **Real-Time Simulation** ✅ - Streaming predictions with live updates
5. **Docker Deployment** ✅ - Single command deployment

**Ready for submission!** 🚀

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review container logs for error details
3. Ensure all prerequisites are met
4. Verify Docker Desktop is running properly

---

**Built with ❤️ for ABB Hackathon T13**