#!/usr/bin/env python3
"""
Simple test script to verify the refactored ML service works correctly
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Service URL
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_data_summary():
    """Test data summary endpoint"""
    print("Testing data summary endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/data-summary")
        print(f"Data summary: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Data summary failed: {e}")
        return False

def test_load_dataset():
    """Test dataset loading"""
    print("Testing dataset loading...")
    
    # Create sample data
    sample_data = []
    base_date = datetime(2021, 1, 1)
    
    for i in range(100):
        record = {
            "data": {
                "synthetic_timestamp": (base_date + timedelta(seconds=i)).strftime("%Y-%m-%d %H:%M:%S"),
                "Response": 1 if i % 3 == 0 else 0,  # 33% pass rate
                "feature1": i * 0.1,
                "feature2": i * 0.2,
                "feature3": i * 0.3
            }
        }
        sample_data.append(record)
    
    try:
        response = requests.post(
            f"{BASE_URL}/load-dataset",
            json={"data": sample_data}
        )
        print(f"Load dataset: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Load dataset failed: {e}")
        return False

def test_training():
    """Test model training"""
    print("Testing model training...")
    
    training_data = {
        "trainStart": "2021-01-01",
        "trainEnd": "2021-01-15",
        "testStart": "2021-01-16",
        "testEnd": "2021-01-20"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/train",
            json=training_data
        )
        print(f"Training: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Training failed: {e}")
        return False

def test_simulation():
    """Test simulation"""
    print("Testing simulation...")
    
    simulation_data = {
        "simulationStart": "2021-01-21",
        "simulationEnd": "2021-01-25"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/simulate",
            json=simulation_data
        )
        print(f"Simulation: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Simulation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Starting ML Service Tests...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Data Summary", test_data_summary),
        ("Load Dataset", test_load_dataset),
        ("Model Training", test_training),
        ("Simulation", test_simulation)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 30)
        success = test_func()
        results.append((test_name, success))
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 50)
    print("Test Results:")
    print("=" * 50)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
        if success:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! The refactored service is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the service logs.")

if __name__ == "__main__":
    main()
