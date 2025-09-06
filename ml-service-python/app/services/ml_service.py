import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import xgboost as xgb
import lightgbm as lgb
from typing import Optional, Dict, Any, List, Tuple
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class MLService:
    """Service class for machine learning operations"""
    
    def __init__(self):
        self.dataset: Optional[pd.DataFrame] = None
        self.model: Optional[Any] = None
        self.model_metrics: Optional[Dict[str, Any]] = None
        self.feature_columns: Optional[List[str]] = None
        
    def load_dataset(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Load and preprocess dataset"""
        try:
            logger.info(f"Loading dataset with {len(data)} records")
            
            # Convert the data to DataFrame
            self.dataset = pd.DataFrame(data)
            
            # Convert synthetic_timestamp to datetime if it exists
            if 'synthetic_timestamp' in self.dataset.columns:
                self.dataset['synthetic_timestamp'] = pd.to_datetime(
                    self.dataset['synthetic_timestamp'], 
                    format='%Y-%m-%d %H:%M:%S'
                )
            elif 'Timestamp' in self.dataset.columns:
                self.dataset['synthetic_timestamp'] = pd.to_datetime(
                    self.dataset['Timestamp'], 
                    format='%Y-%m-%d %H:%M:%S'
                )
            else:
                raise ValueError("No timestamp column found in dataset")
            
            # Identify feature columns (exclude Response and timestamp columns)
            self.feature_columns = [
                col for col in self.dataset.columns 
                if col not in ['Response', 'synthetic_timestamp', 'Timestamp']
            ]
            
            logger.info(f"Dataset loaded successfully: {len(self.dataset)} records, {len(self.feature_columns)} features")
            
            return {
                "message": "Dataset loaded successfully",
                "total_records": len(self.dataset),
                "total_columns": len(self.dataset.columns)
            }
            
        except Exception as e:
            logger.error(f"Failed to load dataset: {str(e)}")
            raise ValueError(f"Failed to load dataset: {str(e)}")
    
    def get_data_summary(self) -> Dict[str, Any]:
        """Get summary statistics of the loaded dataset"""
        if self.dataset is None:
            return {"message": "No data available"}
        
        try:
            pass_rate = 0
            if 'Response' in self.dataset.columns:
                pass_rate = (self.dataset['Response'] == 1).mean() * 100
            
            date_range = "N/A"
            if 'synthetic_timestamp' in self.dataset.columns:
                min_date = self.dataset['synthetic_timestamp'].min()
                max_date = self.dataset['synthetic_timestamp'].max()
                date_range = f"{min_date} to {max_date}"
            
            return {
                "total_records": len(self.dataset),
                "total_columns": len(self.dataset.columns),
                "pass_rate": round(pass_rate, 2),
                "date_range": date_range
            }
            
        except Exception as e:
            logger.error(f"Failed to get data summary: {str(e)}")
            raise ValueError(f"Failed to get data summary: {str(e)}")
    
    def train_model(self, train_start: str, train_end: str, test_start: str, test_end: str) -> Dict[str, Any]:
        """Train the ML model with specified date ranges"""
        if self.dataset is None:
            raise ValueError("No dataset available. Please upload data first.")
        
        try:
            logger.info(f"Starting model training for period {train_start} to {train_end}")
            
            # Convert date strings to datetime for comparison
            train_start_dt = pd.to_datetime(train_start)
            train_end_dt = pd.to_datetime(train_end)
            test_start_dt = pd.to_datetime(test_start)
            test_end_dt = pd.to_datetime(test_end)
            
            # Filter data based on date ranges
            train_data = self.dataset[
                (self.dataset['synthetic_timestamp'] >= train_start_dt) & 
                (self.dataset['synthetic_timestamp'] <= train_end_dt)
            ].copy()
            
            test_data = self.dataset[
                (self.dataset['synthetic_timestamp'] >= test_start_dt) & 
                (self.dataset['synthetic_timestamp'] <= test_end_dt)
            ].copy()
            
            if len(train_data) == 0 or len(test_data) == 0:
                raise ValueError("No data available for the specified date ranges")
            
            logger.info(f"Training data: {len(train_data)} samples, Test data: {len(test_data)} samples")
            
            # Prepare features and target
            X_train = train_data[self.feature_columns]
            y_train = train_data['Response']
            X_test = test_data[self.feature_columns]
            y_test = test_data['Response']
            
            # Train XGBoost model
            logger.info("Training XGBoost model...")
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
            
            self.model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred) * 100
            precision = precision_score(y_test, y_pred, average='weighted') * 100
            recall = recall_score(y_test, y_pred, average='weighted') * 100
            f1 = f1_score(y_test, y_pred, average='weighted') * 100
            
            self.model_metrics = {
                "accuracy": round(accuracy, 2),
                "precision": round(precision, 2),
                "recall": round(recall, 2),
                "f1Score": round(f1, 2),
                "train_samples": len(train_data),
                "test_samples": len(test_data)
            }
            
            logger.info(f"Model training completed successfully. Accuracy: {accuracy:.2f}%")
            
            return {
                "message": "Model trained successfully",
                "accuracy": self.model_metrics["accuracy"],
                "precision": self.model_metrics["precision"],
                "recall": self.model_metrics["recall"],
                "f1Score": self.model_metrics["f1Score"]
            }
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise ValueError(f"Training failed: {str(e)}")
    
    def simulate_predictions(self, sim_start: str, sim_end: str) -> Dict[str, Any]:
        """Run prediction simulation for specified date range"""
        if self.dataset is None:
            raise ValueError("No dataset available")
        
        if self.model is None:
            raise ValueError("No trained model available. Please train a model first.")
        
        try:
            logger.info(f"Starting simulation for period {sim_start} to {sim_end}")
            
            # Convert date strings to datetime for comparison
            sim_start_dt = pd.to_datetime(sim_start)
            sim_end_dt = pd.to_datetime(sim_end)
            
            # Filter data for simulation
            sim_data = self.dataset[
                (self.dataset['synthetic_timestamp'] >= sim_start_dt) & 
                (self.dataset['synthetic_timestamp'] <= sim_end_dt)
            ].copy()
            
            if len(sim_data) == 0:
                raise ValueError("No data available for the specified simulation period")
            
            logger.info(f"Simulation data: {len(sim_data)} samples")
            
            # Prepare features
            X_sim = sim_data[self.feature_columns]
            
            # Make predictions
            predictions = self.model.predict(X_sim)
            prediction_probs = self.model.predict_proba(X_sim)
            confidence_scores = np.max(prediction_probs, axis=1) * 100
            
            # Calculate simulation statistics
            total_predictions = len(predictions)
            pass_count = int(np.sum(predictions == 1))
            fail_count = int(np.sum(predictions == 0))
            avg_confidence = float(np.mean(confidence_scores))
            
            # Create simulation results (limit to first 100 for performance)
            simulation_results = []
            for i in range(min(100, len(sim_data))):
                simulation_results.append({
                    "timestamp": str(sim_data.iloc[i]['synthetic_timestamp']),
                    "sample_id": f"S{i+1:04d}",
                    "prediction": "Pass" if predictions[i] == 1 else "Fail",
                    "confidence": round(confidence_scores[i], 1),
                    "temperature": round(np.random.uniform(20, 30), 1),
                    "pressure": round(np.random.uniform(1000, 1020), 1),
                    "humidity": round(np.random.uniform(40, 80), 1)
                })
            
            logger.info(f"Simulation completed successfully. Total predictions: {total_predictions}")
            
            return {
                "message": "Simulation completed successfully",
                "totalPredictions": total_predictions,
                "passCount": pass_count,
                "failCount": fail_count,
                "averageConfidence": round(avg_confidence, 1),
                "simulationData": simulation_results
            }
            
        except Exception as e:
            logger.error(f"Simulation failed: {str(e)}")
            raise ValueError(f"Simulation failed: {str(e)}")
    
    def is_dataset_loaded(self) -> bool:
        """Check if dataset is loaded"""
        return self.dataset is not None
    
    def is_model_trained(self) -> bool:
        """Check if model is trained"""
        return self.model is not None
