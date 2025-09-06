from fastapi import Depends
from services.ml_service import MLService
import logging

logger = logging.getLogger(__name__)

# Global service instance (singleton pattern)
_ml_service_instance = None

def get_ml_service() -> MLService:
    """Dependency to get ML service instance"""
    global _ml_service_instance
    if _ml_service_instance is None:
        logger.info("Creating new ML service instance")
        _ml_service_instance = MLService()
    return _ml_service_instance

# Type alias for dependency injection
MLServiceDep = Depends(get_ml_service)
