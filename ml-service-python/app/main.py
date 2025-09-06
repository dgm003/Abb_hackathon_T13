from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys
from datetime import datetime
from typing import Dict, Any

from schemas import (
    LoadDatasetRequest, TrainingRequest, SimulationRequest,
    TrainingResponse, SimulationResponse, DataSummary, HealthResponse
)
from services.ml_service import MLService
from dependencies import get_ml_service

# Import and setup logging configuration
from logging_config import setup_logging
setup_logging()

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting ML Service...")
    yield
    logger.info("Shutting down ML Service...")

# Create FastAPI app
app = FastAPI(
    title="ML Service",
    description="Machine Learning Service for Predictive Quality Control",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {"message": "ML Service is running"}

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    logger.info("Health check requested")
    return HealthResponse(
        status="healthy",
        message="ML service is running"
    )

@app.post("/process-data")
async def process_data(data: Dict[str, Any]):
    """Process data endpoint (placeholder)"""
    logger.info(f"Processing data with {len(data)} items")
    try:
        # Process the data here
        # This is a placeholder implementation
        return {"message": "Data processed successfully", "processed_rows": len(data)}
    except Exception as e:
        logger.error(f"Data processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load-dataset")
async def load_dataset(
    request: LoadDatasetRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Load dataset for processing"""
    logger.info(f"Loading dataset with {len(request.data)} records")
    try:
        # Convert Pydantic models to dictionaries
        data = [record.data for record in request.data]
        
        result = ml_service.load_dataset(data)
        logger.info("Dataset loaded successfully")
        return result
        
    except Exception as e:
        logger.error(f"Failed to load dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data-summary", response_model=DataSummary)
async def get_data_summary(ml_service: MLService = Depends(get_ml_service)):
    """Get dataset summary"""
    logger.info("Data summary requested")
    try:
        summary = ml_service.get_data_summary()
        return DataSummary(**summary)
    except Exception as e:
        logger.error(f"Failed to get data summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train", response_model=TrainingResponse)
async def train_model(
    request: TrainingRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Train ML model with specified date ranges"""
    logger.info(f"Training model for period {request.trainStart} to {request.trainEnd}")
    try:
        result = ml_service.train_model(
            train_start=request.trainStart,
            train_end=request.trainEnd,
            test_start=request.testStart,
            test_end=request.testEnd
        )
        return TrainingResponse(**result)
        
    except ValueError as e:
        logger.error(f"Training validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulate", response_model=SimulationResponse)
async def simulate_predictions(
    request: SimulationRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Run prediction simulation for specified date range"""
    logger.info(f"Starting simulation for period {request.simulationStart} to {request.simulationEnd}")
    try:
        result = ml_service.simulate_predictions(
            sim_start=request.simulationStart,
            sim_end=request.simulationEnd
        )
        return SimulationResponse(**result)
        
    except ValueError as e:
        logger.error(f"Simulation validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle validation errors"""
    logger.error(f"Validation error: {str(exc)}")
    return HTTPException(status_code=400, detail=str(exc))

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}")
    return HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)