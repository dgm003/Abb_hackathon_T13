# MiniML - Predictive Quality Control Setup

## Overview
This application provides a complete dataset upload and processing system with the exact UI and functionality you requested.

## Features Implemented ✅

### Frontend (Angular)
- **Step Progress Indicator**: 4-step process with visual progress tracking
- **Drag & Drop Upload**: CSV file upload with visual feedback
- **File Validation**: Ensures only CSV files are accepted
- **Loading State**: Shows processing spinner during file upload
- **Metadata Display**: Beautiful cards showing:
  - Total Records (formatted with commas)
  - Total Columns
  - Pass Rate (percentage)
  - Date Range (synthetic timestamps)
  - File name (clickable for download)
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, professional interface matching your requirements

### Backend (.NET)
- **CSV Parsing**: Uses CsvHelper for robust CSV processing
- **Schema Validation**: Ensures "Response" column exists
- **Synthetic Timestamps**: Generates 1-second granularity timestamps
- **Metadata Calculation**: Computes all required statistics
- **CORS Support**: Configured for frontend communication
- **Error Handling**: Comprehensive error handling and logging

## How to Run

### Option 1: Using Docker Compose (Recommended)
```bash
cd Abb_hackathon_T13
docker-compose up --build
```

This will start:
- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- ML Service: http://localhost:8000

### Option 2: Manual Setup

#### Backend (.NET)
```bash
cd Abb_hackathon_T13/backend-dotnet
dotnet restore
dotnet run
```

#### Frontend (Angular)
```bash
cd Abb_hackathon_T13/frontend-angular
npm install
ng serve
```

## Usage

1. **Upload Dataset**: Drag and drop a CSV file or click "Choose File"
2. **File Processing**: The system will:
   - Validate the CSV format
   - Check for required "Response" column
   - Generate synthetic timestamps if missing
   - Calculate metadata (records, columns, pass rate, date range)
3. **View Results**: See the processed data in beautiful summary cards
4. **Proceed**: Click "Next" to continue to the next step

## API Endpoints

- `POST /api/data/upload` - Upload and process CSV file
- `GET /api/data/summary` - Get data summary
- `POST /api/data/process` - Process data
- `GET /api/data/health` - Health check

## Requirements Met

✅ User uploads Kaggle CSV dataset using drag-and-drop interface  
✅ File validation for .csv format  
✅ Backend API parsing and augmentation with synthetic timestamps  
✅ Metadata calculation (records, columns, pass rate, date range)  
✅ UI displays extracted metadata in summary cards  
✅ Step progress indicator (Step 1 of 4)  
✅ Tab navigation for all 4 steps  
✅ Upload card with drag-and-drop area and dashed border  
✅ "Choose File" button functionality  
✅ CSV icon placeholder  
✅ Instruction text  
✅ Post-upload info summary cards  
✅ Next button (disabled until file processed)  
✅ Clickable file name for download  

The application is now ready to use and matches your exact requirements!
