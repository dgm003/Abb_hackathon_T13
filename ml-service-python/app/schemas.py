from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd

class DatasetRecord(BaseModel):
    """Schema for individual dataset records"""
    data: Dict[str, Any] = Field(..., description="Record data as key-value pairs")

class LoadDatasetRequest(BaseModel):
    """Schema for loading dataset request"""
    data: List[DatasetRecord] = Field(..., description="List of dataset records")
    
    @validator('data')
    def validate_data_not_empty(cls, v):
        if not v:
            raise ValueError('Dataset cannot be empty')
        return v

class TrainingRequest(BaseModel):
    """Schema for model training request"""
    trainStart: str = Field(..., description="Training period start date (YYYY-MM-DD)")
    trainEnd: str = Field(..., description="Training period end date (YYYY-MM-DD)")
    testStart: str = Field(..., description="Testing period start date (YYYY-MM-DD)")
    testEnd: str = Field(..., description="Testing period end date (YYYY-MM-DD)")
    
    @validator('trainStart', 'trainEnd', 'testStart', 'testEnd')
    def validate_date_format(cls, v):
        try:
            pd.to_datetime(v)
            return v
        except:
            raise ValueError(f'Invalid date format: {v}. Expected YYYY-MM-DD')
    
    @validator('trainEnd')
    def validate_train_end_after_start(cls, v, values):
        if 'trainStart' in values:
            if pd.to_datetime(v) <= pd.to_datetime(values['trainStart']):
                raise ValueError('Training end date must be after start date')
        return v
    
    @validator('testStart')
    def validate_test_start_after_train_end(cls, v, values):
        if 'trainEnd' in values:
            if pd.to_datetime(v) <= pd.to_datetime(values['trainEnd']):
                raise ValueError('Testing start date must be after training end date')
        return v
    
    @validator('testEnd')
    def validate_test_end_after_start(cls, v, values):
        if 'testStart' in values:
            if pd.to_datetime(v) <= pd.to_datetime(values['testStart']):
                raise ValueError('Testing end date must be after start date')
        return v

class SimulationRequest(BaseModel):
    """Schema for simulation request"""
    simulationStart: str = Field(..., description="Simulation period start date (YYYY-MM-DD)")
    simulationEnd: str = Field(..., description="Simulation period end date (YYYY-MM-DD)")
    
    @validator('simulationStart', 'simulationEnd')
    def validate_date_format(cls, v):
        try:
            pd.to_datetime(v)
            return v
        except:
            raise ValueError(f'Invalid date format: {v}. Expected YYYY-MM-DD')
    
    @validator('simulationEnd')
    def validate_simulation_end_after_start(cls, v, values):
        if 'simulationStart' in values:
            if pd.to_datetime(v) <= pd.to_datetime(values['simulationStart']):
                raise ValueError('Simulation end date must be after start date')
        return v

class ModelMetrics(BaseModel):
    """Schema for model performance metrics"""
    accuracy: float = Field(..., ge=0, le=100, description="Model accuracy percentage")
    precision: float = Field(..., ge=0, le=100, description="Model precision percentage")
    recall: float = Field(..., ge=0, le=100, description="Model recall percentage")
    f1Score: float = Field(..., ge=0, le=100, description="Model F1 score percentage")
    train_samples: int = Field(..., gt=0, description="Number of training samples")
    test_samples: int = Field(..., gt=0, description="Number of testing samples")

class TrainingResponse(BaseModel):
    """Schema for training response"""
    message: str = Field(..., description="Response message")
    accuracy: float = Field(..., description="Model accuracy")
    precision: float = Field(..., description="Model precision")
    recall: float = Field(..., description="Model recall")
    f1Score: float = Field(..., description="Model F1 score")

class SimulationData(BaseModel):
    """Schema for individual simulation data point"""
    timestamp: str = Field(..., description="Sample timestamp")
    sample_id: str = Field(..., description="Sample identifier")
    prediction: str = Field(..., description="Prediction result (Pass/Fail)")
    confidence: float = Field(..., ge=0, le=100, description="Prediction confidence percentage")
    temperature: float = Field(..., description="Simulated temperature")
    pressure: float = Field(..., description="Simulated pressure")
    humidity: float = Field(..., description="Simulated humidity")

class SimulationResponse(BaseModel):
    """Schema for simulation response"""
    message: str = Field(..., description="Response message")
    totalPredictions: int = Field(..., ge=0, description="Total number of predictions made")
    passCount: int = Field(..., ge=0, description="Number of pass predictions")
    failCount: int = Field(..., ge=0, description="Number of fail predictions")
    averageConfidence: float = Field(..., ge=0, le=100, description="Average prediction confidence")
    simulationData: List[SimulationData] = Field(..., description="Detailed simulation results")

class DataSummary(BaseModel):
    """Schema for dataset summary"""
    total_records: int = Field(..., ge=0, description="Total number of records")
    total_columns: int = Field(..., ge=0, description="Total number of columns")
    pass_rate: float = Field(..., ge=0, le=100, description="Pass rate percentage")
    date_range: str = Field(..., description="Date range of the dataset")

class HealthResponse(BaseModel):
    """Schema for health check response"""
    status: str = Field(..., description="Service status")
    message: str = Field(..., description="Status message")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")