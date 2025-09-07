# System Architecture

## Overview
IntelliInspect is a full-stack AI-powered application for real-time quality control prediction using production line sensor data. The system follows a microservices architecture with three main components.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ML Service    │
│   (Angular)     │    │   (.NET 8)      │    │   (Python)      │
│                 │    │                 │    │                 │
│  Port: 4200     │◄──►│  Port: 8080     │◄──►│  Port: 8000     │
│                 │    │                 │    │                 │
│ • Upload UI     │    │ • File Upload   │    │ • Data Process  │
│ • Date Ranges   │    │ • CSV Parser    │    │ • ML Training   │
│ • Model Train   │    │ • API Gateway   │    │ • Predictions   │
│ • Simulation    │    │ • Health Check  │    │ • FastAPI       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │                 │
                    │ • CSV Files     │
                    │ • Preprocessed  │
                    │ • Models        │
                    └─────────────────┘
```

## Data Flow Diagram

```
1. User Upload
   ┌─────────────┐
   │ User        │
   └─────┬───────┘
         │ CSV File
         ▼
   ┌─────────────┐
   │ Frontend    │
   │ (Angular)   │
   └─────┬───────┘
         │ HTTP POST
         ▼
   ┌─────────────┐
   │ Backend     │
   │ (.NET 8)    │
   └─────┬───────┘
         │ Process & Store
         ▼
   ┌─────────────┐
   │ Data Layer  │
   │ (CSV Files) │
   └─────────────┘

2. Model Training
   ┌─────────────┐
   │ Frontend    │
   │ (Training)  │
   └─────┬───────┘
         │ HTTP POST
         ▼
   ┌─────────────┐
   │ Backend     │
   │ (.NET 8)    │
   └─────┬───────┘
         │ Forward Request
         ▼
   ┌─────────────┐
   │ ML Service  │
   │ (Python)    │
   └─────┬───────┘
         │ Train Model
         ▼
   ┌─────────────┐
   │ Data Layer  │
   │ (Models)    │
   └─────────────┘

3. Real-time Simulation
   ┌─────────────┐
   │ Frontend    │
   │ (Simulation)│
   └─────┬───────┘
         │ HTTP POST
         ▼
   ┌─────────────┐
   │ Backend     │
   │ (.NET 8)    │
   └─────┬───────┘
         │ Forward Request
         ▼
   ┌─────────────┐
   │ ML Service  │
   │ (Python)    │
   └─────┬───────┘
         │ Generate Predictions
         ▼
   ┌─────────────┐
   │ Frontend    │
   │ (Live UI)   │
   └─────────────┘
```

## Technology Stack

### Frontend (Angular 17)
- **Framework**: Angular 17 with standalone components
- **UI**: Custom CSS with modern design
- **Charts**: Plotly.js for data visualization
- **HTTP**: Angular HttpClient for API communication
- **Deployment**: Docker with Nginx

### Backend (.NET 8)
- **Framework**: .NET 8 Web API
- **Language**: C#
- **Features**: 
  - File upload handling
  - CSV parsing and validation
  - API gateway functionality
  - Health checks
- **Deployment**: Docker

### ML Service (Python)
- **Framework**: FastAPI
- **ML Libraries**: XGBoost, LightGBM, scikit-learn
- **Data Processing**: pandas, numpy
- **Features**:
  - Data preprocessing
  - Model training
  - Real-time predictions
  - Feature importance analysis
- **Deployment**: Docker

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Networking**: Custom bridge network
- **Data Storage**: File-based (CSV files)
- **Ports**: 4200 (Frontend), 8080 (Backend), 8000 (ML Service)

## API Contracts

### Backend API (.NET 8)

#### File Upload
```
POST /api/data/upload
Content-Type: multipart/form-data

Request:
- file: CSV file

Response:
{
  "success": boolean,
  "message": string,
  "data": {
    "fileName": string,
    "fileSize": number,
    "totalRecords": number,
    "columnCount": number,
    "passRate": number,
    "dateRange": {
      "start": string,
      "end": string
    }
  }
}
```

#### Health Check
```
GET /api/data/health

Response:
{
  "status": "healthy",
  "timestamp": string
}
```

### ML Service API (Python FastAPI)

#### Data Processing
```
POST /process-data
Content-Type: application/json

Request:
{
  "filePath": string
}

Response:
{
  "success": boolean,
  "message": string,
  "processedData": {
    "totalRecords": number,
    "features": string[],
    "target": string
  }
}
```

#### Model Training
```
POST /train-model
Content-Type: application/json

Request:
{
  "dataPath": string,
  "algorithm": string
}

Response:
{
  "success": boolean,
  "message": string,
  "metrics": {
    "accuracy": number,
    "precision": number,
    "recall": number,
    "f1": number,
    "modelInfo": {
      "modelId": string,
      "version": string,
      "algorithm": string,
      "trainingSamples": number,
      "testSamples": number,
      "trainingTime": number
    }
  }
}
```

#### Real-time Simulation
```
POST /simulate
Content-Type: application/json

Request:
{
  "modelPath": string,
  "duration": number
}

Response:
{
  "success": boolean,
  "message": string,
  "simulationData": {
    "predictions": [
      {
        "time": string,
        "sampleId": string,
        "prediction": string,
        "confidence": number,
        "features": object
      }
    ]
  }
}
```

## Security Considerations

- CORS configuration for cross-origin requests
- File validation for uploaded CSV files
- Input sanitization for API endpoints
- Error handling without exposing sensitive information

## Scalability Considerations

- Microservices architecture allows independent scaling
- Stateless services for horizontal scaling
- File-based storage for simplicity (can be upgraded to database)
- Docker containers for easy deployment and scaling

## Monitoring and Logging

- Health check endpoints for all services
- Error handling and logging in all components
- Docker container logs for debugging
- Frontend error handling with user-friendly messages
