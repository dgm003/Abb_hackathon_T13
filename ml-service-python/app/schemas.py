from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

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
