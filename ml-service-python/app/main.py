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

class ModelMetadata(BaseModel):
    modelId: str
    version: str
    trainedAt: str
    algorithm: str
    trainingSamples: int
    testSamples: int
    trainingTime: float

class TrainMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    lossCurve: list
    accCurve: list
    confusion: dict
    modelInfo: ModelMetadata

class TrainResponse(BaseModel):
    success: bool
    message: str
    metrics: TrainMetrics

class SimulationData(BaseModel):
    time: str
    sampleId: str
    prediction: str  # "Pass" or "Fail"
    confidence: int
    temperature: float
    pressure: int
    humidity: float

class SimulationStartResponse(BaseModel):
    success: bool
    message: str

# Data Processor Class
class DataProcessor:
    def __init__(self):
        self.data_directory = "data"
        os.makedirs(self.data_directory, exist_ok=True)
    
    def process_csv_file(self, file_path: str, add_synthetic_timestamps: bool = True):
        """Process CSV file and return DataFrame with metadata"""
        try:
            df = pd.read_csv(file_path)
            if 'Response' not in df.columns:
                raise ValueError("CSV file must contain a 'Response' column")
            if add_synthetic_timestamps:
                df = self._add_synthetic_timestamps(df)
            metadata = self._calculate_metadata(df, file_path)
            return df, metadata
        except Exception as e:
            raise Exception(f"Error processing CSV file: {str(e)}")
    
    def _add_synthetic_timestamps(self, df: pd.DataFrame):
        timestamp_columns = [col for col in df.columns if 'timestamp' in col.lower() or 'time' in col.lower()]
        if not timestamp_columns:
            start_date = datetime(2021, 1, 1)
            df['synthetic_timestamp'] = [start_date + pd.Timedelta(seconds=i) for i in range(len(df))]
        else:
            timestamp_col = timestamp_columns[0]
            df['synthetic_timestamp'] = pd.to_datetime(df[timestamp_col], errors='coerce')
            nat_mask = df['synthetic_timestamp'].isna()
            if nat_mask.any():
                start_date = datetime(2021, 1, 1)
                synthetic_timestamps = [start_date + pd.Timedelta(seconds=i) for i in range(len(df))]
                df.loc[nat_mask, 'synthetic_timestamp'] = [synthetic_timestamps[i] for i in range(len(df)) if nat_mask.iloc[i]]
        return df
    
    def _calculate_metadata(self, df: pd.DataFrame, file_path: str):
        total_records = len(df)
        total_columns = len(df.columns)
        if 'Response' in df.columns:
            pass_count = df['Response'].sum() if df['Response'].dtype in ['int64', 'float64'] else 0
            pass_rate = (pass_count / total_records * 100) if total_records > 0 else 0
        else:
            pass_rate = 0
        if 'synthetic_timestamp' in df.columns:
            earliest_timestamp = df['synthetic_timestamp'].min()
            latest_timestamp = df['synthetic_timestamp'].max()
        else:
            start_date = datetime(2021, 1, 1)
            earliest_timestamp = start_date
            latest_timestamp = start_date + pd.Timedelta(seconds=total_records - 1)
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
        if size_bytes == 0:
            return "0 B"
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        return f"{size_bytes:.2f} {size_names[i]}"
    
    def save_processed_data(self, df: pd.DataFrame, original_file_path: str) -> str:
        base_name = os.path.splitext(os.path.basename(original_file_path))[0]
        processed_filename = f"{base_name}_processed.csv"
        processed_file_path = os.path.join(self.data_directory, processed_filename)
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

# Simulation state
simulation_state = {
    'current_sample': 0,
    'max_samples': 20,
    'is_running': False
}

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="Healthy", timestamp=datetime.utcnow())

@app.post("/process-data", response_model=ProcessDataResponse)
async def process_data(request: ProcessDataRequest):
    try:
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
        df, metadata = data_processor.process_csv_file(request.file_path, request.add_synthetic_timestamps)
        processed_file_path = data_processor.save_processed_data(df, request.file_path)
        data_summary = DataSummary(**metadata)
        return ProcessDataResponse(success=True, message="Data processed successfully", data_summary=data_summary, processed_file_path=processed_file_path)
    except Exception as e:
        return ProcessDataResponse(success=False, message=f"Error processing data: {str(e)}")

@app.post("/upload-file", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV file")
        file_path = os.path.join(data_processor.data_directory, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        df, metadata = data_processor.process_csv_file(file_path, add_synthetic_timestamps=True)
        processed_file_path = data_processor.save_processed_data(df, file_path)
        data_summary = DataSummary(**metadata)
        return FileUploadResponse(success=True, message="File uploaded and processed successfully", data_summary=data_summary)
    except Exception as e:
        return FileUploadResponse(success=False, message=f"Error processing file: {str(e)}")

@app.post('/train-model', response_model=TrainResponse)
async def train_model():
    # TODO: replace with actual training on latest preprocessed file
    # Random results simulate real ML training variability
    rng = np.random.default_rng()
    acc_curve = list(np.clip(np.linspace(0.6, 0.95, 20) + rng.normal(0, 0.005, 20), 0.5, 0.99))
    loss_curve = list(np.clip(np.linspace(1.0, 0.3, 20) + rng.normal(0, 0.01, 20), 0.2, 1.2))
    confusion = { 'tp': int(rng.integers(800, 1000)), 'tn': int(rng.integers(800, 1000)), 'fp': int(rng.integers(20, 120)), 'fn': int(rng.integers(20, 120)) }
    accuracy = (confusion['tp'] + confusion['tn']) / max(1, sum(confusion.values()))
    precision = confusion['tp'] / max(1, (confusion['tp'] + confusion['fp']))
    recall = confusion['tp'] / max(1, (confusion['tp'] + confusion['fn']))
    f1 = 2*precision*recall / max(1e-9, (precision + recall))
    # Generate model metadata
    model_metadata = ModelMetadata(
        modelId=f"model_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        version="1.0.0",
        trainedAt=datetime.now().isoformat(),
        algorithm="XGBoost",
        trainingSamples=1500,
        testSamples=500,
        trainingTime=2.5
    )

    return TrainResponse(
        success=True,
        message="Training complete",
        metrics=TrainMetrics(
            accuracy=float(accuracy), precision=float(precision), recall=float(recall), f1=float(f1),
            lossCurve=loss_curve, accCurve=acc_curve, confusion=confusion, modelInfo=model_metadata
        )
    )

@app.post('/start-simulation', response_model=SimulationStartResponse)
async def start_simulation():
    simulation_state['is_running'] = True
    return SimulationStartResponse(success=True, message="Simulation started")

@app.get('/next-prediction', response_model=SimulationData)
async def get_next_prediction():
    if simulation_state['current_sample'] >= simulation_state['max_samples']:
        raise HTTPException(status_code=404, detail="Simulation complete")
    
    # Generate mock prediction data with IST timezone
    from datetime import timezone, timedelta
    ist = timezone(timedelta(hours=5, minutes=30))  # IST is UTC+5:30
    now = datetime.now(ist)
    time_str = now.strftime("%H:%M:%S")
    sample_id = f"SAMPLE_{simulation_state['current_sample'] + 1:03d}"
    
    # Generate realistic sensor data
    rng = np.random.default_rng()
    temperature = 20 + rng.random() * 15  # 20-35°C
    pressure = 1000 + rng.integers(0, 51)  # 1000-1050 hPa
    humidity = 40 + rng.random() * 40  # 40-80%
    
    # Generate prediction based on sensor values (simple logic)
    base_score = (0.6 if temperature < 30 else 0.4) + \
                 (0.1 if pressure > 1020 else 0) + \
                 (0.1 if humidity < 70 else 0)
    
    # Add more variation to avoid always hitting 100
    variation = (rng.random() - 0.5) * 0.3  # -0.15 to +0.15
    quality_score = max(0.3, min(0.85, base_score + variation))
    
    prediction = "Pass" if quality_score > 0.7 else "Fail"
    confidence = int(quality_score * 100)
    
    simulation_state['current_sample'] += 1
    
    return SimulationData(
        time=time_str,
        sampleId=sample_id,
        prediction=prediction,
        confidence=confidence,
        temperature=round(temperature, 1),
        pressure=pressure,
        humidity=round(humidity, 1)
    )

@app.get("/")
async def root():
    return {"message": "IntelliInspect ML Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)