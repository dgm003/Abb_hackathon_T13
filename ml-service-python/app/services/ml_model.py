import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import lightgbm as lgb
from typing import Dict, Any, Tuple
import joblib
import os

class MLModelService:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_directory = "models"
        os.makedirs(self.model_directory, exist_ok=True)
    
    def train_model(self, df: pd.DataFrame, target_column: str = 'Response', 
                   test_size: float = 0.2, model_type: str = 'xgboost') -> Dict[str, Any]:
        """
        Train a machine learning model on the provided DataFrame
        """
        try:
            # Prepare features and target
            if target_column not in df.columns:
                raise ValueError(f"Target column '{target_column}' not found in DataFrame")
            
            # Select numeric features only (exclude target and timestamp columns)
            feature_columns = df.select_dtypes(include=[np.number]).columns.tolist()
            feature_columns = [col for col in feature_columns if col != target_column and 'timestamp' not in col.lower()]
            
            if not feature_columns:
                raise ValueError("No numeric feature columns found for training")
            
            X = df[feature_columns]
            y = df[target_column]
            
            # Handle missing values
            X = X.fillna(X.mean())
            y = y.fillna(0)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            if model_type == 'xgboost':
                self.model = xgb.XGBClassifier(
                    n_estimators=100,
                    max_depth=6,
                    learning_rate=0.1,
                    random_state=42
                )
            elif model_type == 'lightgbm':
                self.model = lgb.LGBMClassifier(
                    n_estimators=100,
                    max_depth=6,
                    learning_rate=0.1,
                    random_state=42,
                    verbose=-1
                )
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            # Train the model
            self.model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test_scaled)
            y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
            
            # Calculate metrics
            metrics = self._calculate_metrics(y_test, y_pred, y_pred_proba)
            
            # Save model and artifacts
            model_path = os.path.join(self.model_directory, f"{model_type}_model.joblib")
            scaler_path = os.path.join(self.model_directory, f"{model_type}_scaler.joblib")
            features_path = os.path.join(self.model_directory, f"{model_type}_features.txt")
            
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)
            # Persist feature column order for simulation
            with open(features_path, 'w') as f:
                f.write("\n".join(feature_columns))
            
            return {
                'success': True,
                'metrics': metrics,
                'feature_columns': feature_columns,
                'model_path': model_path,
                'scaler_path': scaler_path
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_metrics(self, y_true, y_pred, y_pred_proba) -> Dict[str, float]:
        """
        Calculate evaluation metrics
        """
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        # Confusion matrix (force 2x2 even if a class is missing)
        cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
        # Ensure shape (2,2)
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel()
        else:
            # Fallback safe defaults
            tn, fp, fn, tp = 0, 0, 0, 0
        
        return {
            'accuracy': round(accuracy * 100, 2),
            'precision': round(precision * 100, 2),
            'recall': round(recall * 100, 2),
            'f1_score': round(f1 * 100, 2),
            'confusion_matrix': {
                'true_negatives': int(tn),
                'false_positives': int(fp),
                'false_negatives': int(fn),
                'true_positives': int(tp)
            }
        }
    
    def predict(self, X: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Make predictions using the trained model
        """
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)[:, 1]
        
        return predictions, probabilities
    
    def load_model(self, model_path: str, scaler_path: str):
        """
        Load a pre-trained model and scaler
        """
        self.model = joblib.load(model_path)
        self.scaler = joblib.load(scaler_path)
        # Load features list if present
        features_file = model_path.replace('_model.joblib', '_features.txt')
        if os.path.exists(features_file):
            with open(features_file, 'r') as f:
                self.feature_list = [line.strip() for line in f.readlines() if line.strip()]
        else:
            self.feature_list = None
