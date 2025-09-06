import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Optional
import os

class DataProcessor:
    def __init__(self):
        self.data_directory = "data"
        os.makedirs(self.data_directory, exist_ok=True)
    
    def process_csv_file(self, file_path: str, add_synthetic_timestamps: bool = True) -> Tuple[pd.DataFrame, dict]:
        """
        Process CSV file and return DataFrame with metadata
        """
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
    
    def _add_synthetic_timestamps(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add synthetic timestamps starting from 2021-01-01 with 1-second granularity
        """
        # Check if timestamp column already exists
        timestamp_columns = [col for col in df.columns if 'timestamp' in col.lower() or 'time' in col.lower()]
        
        if not timestamp_columns:
            # Add synthetic timestamp column
            start_date = datetime(2021, 1, 1)
            df['synthetic_timestamp'] = [start_date + timedelta(seconds=i) for i in range(len(df))]
        else:
            # Use existing timestamp column
            timestamp_col = timestamp_columns[0]
            df['synthetic_timestamp'] = pd.to_datetime(df[timestamp_col], errors='coerce')
            
            # Fill any NaT values with synthetic timestamps
            nat_mask = df['synthetic_timestamp'].isna()
            if nat_mask.any():
                start_date = datetime(2021, 1, 1)
                synthetic_timestamps = [start_date + timedelta(seconds=i) for i in range(len(df))]
                df.loc[nat_mask, 'synthetic_timestamp'] = [synthetic_timestamps[i] for i in range(len(df)) if nat_mask.iloc[i]]
        
        return df
    
    def _calculate_metadata(self, df: pd.DataFrame, file_path: str) -> dict:
        """
        Calculate metadata from the DataFrame
        """
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
            latest_timestamp = start_date + timedelta(seconds=total_records - 1)
        
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
        """
        Format file size in human readable format
        """
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.2f} {size_names[i]}"
    
    def save_processed_data(self, df: pd.DataFrame, original_file_path: str) -> str:
        """
        Save processed DataFrame to a new file
        """
        # Generate new filename
        base_name = os.path.splitext(os.path.basename(original_file_path))[0]
        processed_filename = f"{base_name}_processed.csv"
        processed_file_path = os.path.join(self.data_directory, processed_filename)
        
        # Save processed data
        df.to_csv(processed_file_path, index=False)
        
        return processed_file_path
