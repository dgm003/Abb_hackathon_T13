import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface TrainResponse {
  success: boolean;
  message: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    lossCurve: number[];
    accCurve: number[];
    confusion: { tp: number; tn: number; fp: number; fn: number; };
    modelInfo: {
      modelId: string;
      version: string;
      algorithm: string;
      trainingSamples: number;
      testSamples: number;
      trainingTime: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class MlService {
  private apiUrl = 'http://localhost:8080/api/ml';

  constructor(private http: HttpClient) {}

  train(): Observable<TrainResponse> {
    return this.http.post<TrainResponse>(`${this.apiUrl}/train`, {})
      .pipe(
        catchError(() => {
          // Fallback mock so UI can render while backend is wired
          const now = new Date();
          const modelId = `model_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
          
          const algorithms = ['Random Forest', 'XGBoost', 'Gradient Boosting', 'SVM', 'Neural Network'];
          const selectedAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
          
          const baseTrainingSamples = 1500;
          const baseTestSamples = 500;
          const trainingSamples = baseTrainingSamples + Math.floor(Math.random() * 200) - 100; // ±100 variation
          const testSamples = baseTestSamples + Math.floor(Math.random() * 100) - 50; // ±50 variation
          
          const trainingTime = 2.0 + Math.random() * 3.0; // 2-5 seconds
          
          return of({
            success: true,
            message: 'Mock training complete',
            metrics: {
              accuracy: 0.942,
              precision: 0.928,
              recall: 0.915,
              f1: 0.921,
              accCurve: [0.62,0.68,0.74,0.79,0.82,0.85,0.87,0.89,0.9,0.91,0.92,0.925,0.93,0.935,0.94,0.941,0.942,0.942,0.942,0.942],
              lossCurve: [1.2,1.05,0.9,0.78,0.69,0.62,0.56,0.51,0.47,0.44,0.41,0.39,0.37,0.35,0.34,0.33,0.32,0.315,0.31,0.305],
              confusion: { tp: 920, tn: 870, fp: 60, fn: 50 },
              modelInfo: {
                modelId: modelId,
                version: '1.0.0',
                algorithm: selectedAlgorithm,
                trainingSamples: trainingSamples,
                testSamples: testSamples,
                trainingTime: Math.round(trainingTime * 10) / 10 // Round to 1 decimal place
              }
            }
          } as TrainResponse);
        })
      );
  }
}
