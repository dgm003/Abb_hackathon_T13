from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pandas as pd
import numpy as np
from typing import Optional
from pydantic import BaseModel
import os

# Define schemas directly in main.py
class DataSummary(BaseModel):
    file_name: str
    total_records: int
    total_columns: int
    pass_rate: float
    earliest_timestamp: datetime
    latest_timestamp: datetime
    file_size: str

class FileUploadResponse(BaseModel):
    success: bool
    message: str
    data_summary: Optional[DataSummary] = None

class ProcessDataRequest(BaseModel):
    file_path: str
    add_synthetic_timestamps: bool = True

class ProcessDataResponse(BaseModel):
    success: bool
    message: str
    data_summary: Optional[DataSummary] = None
    processed_file_path: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime

# Data Processor Class
class DataProcessor:
    def __init__(self):
        self.data_directory = "data"
        os.makedirs(self.data_directory, exist_ok=True)
    
    def process_csv_file(self, file_path: str, add_synthetic_timestamps: bool = True):
        """Process CSV file and return DataFrame with metadata"""
        try:
            # Read CSV file
            df = pd.read_csv(file_path)
            
            # Validate that Response column exists
            if 'Response' not in df.columns:
                raise ValueError("CSV file must contain a 'Response' column")
            
            # Add synthetic timestamps if requested and not present
            if add_synthetic_timestamps:
                df = self._add_synthetic_timestamps(df)
            
            # Calculate metadata
            metadata = self._calculate_metadata(df, file_path)
            
            return df, metadata
            
        except Exception as e:
            raise Exception(f"Error processing CSV file: {str(e)}")
    
    def _add_synthetic_timestamps(self, df: pd.DataFrame):
        """Add synthetic timestamps starting from 2021-01-01 with 1-second granularity"""
        # Check if timestamp column already exists
        timestamp_columns = [col for col in df.columns if 'timestamp' in col.lower() or 'time' in col.lower()]
        
        if not timestamp_columns:
            # Add synthetic timestamp column
            start_date = datetime(2021, 1, 1)
            df['synthetic_timestamp'] = [start_date + pd.Timedelta(seconds=i) for i in range(len(df))]
        else:
            # Use existing timestamp column
            timestamp_col = timestamp_columns[0]
            df['synthetic_timestamp'] = pd.to_datetime(df[timestamp_col], errors='coerce')
            
            # Fill any NaT values with synthetic timestamps
            nat_mask = df['synthetic_timestamp'].isna()
            if nat_mask.any():
                start_date = datetime(2021, 1, 1)
                synthetic_timestamps = [start_date + pd.Timedelta(seconds=i) for i in range(len(df))]
                df.loc[nat_mask, 'synthetic_timestamp'] = [synthetic_timestamps[i] for i in range(len(df)) if nat_mask.iloc[i]]
        
        return df
    
    def _calculate_metadata(self, df: pd.DataFrame, file_path: str):
        """Calculate metadata from the DataFrame"""
        # Basic counts
        total_records = len(df)
        total_columns = len(df.columns)
        
        # Pass rate calculation
        if 'Response' in df.columns:
            pass_count = df['Response'].sum() if df['Response'].dtype in ['int64', 'float64'] else 0
            pass_rate = (pass_count / total_records * 100) if total_records > 0 else 0
        else:
            pass_rate = 0
        
        # Timestamp range
        if 'synthetic_timestamp' in df.columns:
            earliest_timestamp = df['synthetic_timestamp'].min()
            latest_timestamp = df['synthetic_timestamp'].max()
        else:
            # Fallback to synthetic timestamps
            start_date = datetime(2021, 1, 1)
            earliest_timestamp = start_date
            latest_timestamp = start_date + pd.Timedelta(seconds=total_records - 1)
        
        # File size
        file_size = self._format_file_size(os.path.getsize(file_path))
        
        return {
            'file_name': os.path.basename(file_path),
            'total_records': total_records,
            'total_columns': total_columns,
            'pass_rate': round(pass_rate, 2),
            'earliest_timestamp': earliest_timestamp,
            'latest_timestamp': latest_timestamp,
            'file_size': file_size
        }
    
    def _format_file_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.2f} {size_names[i]}"
    
    def save_processed_data(self, df: pd.DataFrame, original_file_path: str) -> str:
        """Save processed DataFrame to a new file"""
        # Generate new filename
        base_name = os.path.splitext(os.path.basename(original_file_path))[0]
        processed_filename = f"{base_name}_processed.csv"
        processed_file_path = os.path.join(self.data_directory, processed_filename)
        
        # Save processed data
        df.to_csv(processed_file_path, index=False)
        
        return processed_file_path

# Initialize FastAPI app
app = FastAPI(title="IntelliInspect ML Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
data_processor = DataProcessor()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="Healthy",
        timestamp=datetime.utcnow()
    )

@app.post("/process-data", response_model=ProcessDataResponse)
async def process_data(request: ProcessDataRequest):
    """Process CSV data and add synthetic timestamps if needed"""
    try:
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Process the CSV file
        df, metadata = data_processor.process_csv_file(
            request.file_path, 
            request.add_synthetic_timestamps
        )
        
        # Save processed data
        processed_file_path = data_processor.save_processed_data(df, request.file_path)
        
        # Create data summary
        data_summary = DataSummary(**metadata)
        
        return ProcessDataResponse(
            success=True,
            message="Data processed successfully",
            data_summary=data_summary,
            processed_file_path=processed_file_path
        )
        
    except Exception as e:
        return ProcessDataResponse(
            success=False,
            message=f"Error processing data: {str(e)}"
        )

@app.post("/upload-file", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a CSV file"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        
        # Save uploaded file
        file_path = os.path.join(data_processor.data_directory, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process the file
        df, metadata = data_processor.process_csv_file(file_path, add_synthetic_timestamps=True)
        
        # Save processed data
        processed_file_path = data_processor.save_processed_data(df, file_path)
        
        # Create data summary
        data_summary = DataSummary(**metadata)
        
        return FileUploadResponse(
            success=True,
            message="File uploaded and processed successfully",
            data_summary=data_summary
        )
        
    except Exception as e:
        return FileUploadResponse(
            success=False,
            message=f"Error processing file: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "IntelliInspect ML Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)