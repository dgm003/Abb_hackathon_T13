import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, map, takeWhile, switchMap, of, filter } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SimulationData {
  time: string;
  sampleId: string;
  prediction: 'Pass' | 'Fail';
  confidence: number;
  temperature: number;
  pressure: number;
  humidity: number;
}

export interface SimulationStats {
  total: number;
  pass: number;
  fail: number;
  avgConfidence: number;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private apiUrl = 'http://localhost:8080/api/simulation';

  constructor(private http: HttpClient) { }

  startSimulation(): Observable<SimulationData> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/start`, {})
      .pipe(
        switchMap(() => {
          // Start polling for simulation data
          return interval(1000).pipe(
            switchMap(() => this.getNextPrediction()),
            filter((data): data is SimulationData => data !== null),
            takeWhile(data => data !== null, true)
          );
        }),
        catchError(error => {
          console.warn('Simulation API call failed, using mock data:', error);
          return this.getMockSimulationData();
        })
      );
  }

  private getNextPrediction(): Observable<SimulationData | null> {
    return this.http.get<SimulationData | null>(`${this.apiUrl}/next`)
      .pipe(
        catchError(() => of(null))
      );
  }

  private getMockSimulationData(): Observable<SimulationData> {
    // Generate mock simulation data
    const sampleCount = 20;
    let currentSample = 0;

    return interval(1000).pipe(
      map(() => {
        if (currentSample >= sampleCount) {
          throw new Error('Simulation complete');
        }

        const now = new Date();
        const time = now.toLocaleTimeString();
        const sampleId = `SAMPLE_${String(currentSample + 1).padStart(3, '0')}`;
        
        // Generate realistic sensor data
        const temperature = 20 + Math.random() * 15; // 20-35°C
        const pressure = 1000 + Math.random() * 50; // 1000-1050 hPa
        const humidity = 40 + Math.random() * 40; // 40-80%
        
        // Generate prediction based on sensor values (simple logic)
        const qualityScore = (temperature < 30 ? 0.8 : 0.6) + 
                           (pressure > 1020 ? 0.1 : 0) + 
                           (humidity < 70 ? 0.1 : 0) + 
                           (Math.random() * 0.2);
        
        const prediction: 'Pass' | 'Fail' = qualityScore > 0.7 ? 'Pass' : 'Fail';
        const confidence = Math.round(qualityScore * 100);

        currentSample++;

        return {
          time,
          sampleId,
          prediction,
          confidence,
          temperature: Math.round(temperature * 10) / 10,
          pressure: Math.round(pressure),
          humidity: Math.round(humidity * 10) / 10
        };
      }),
      takeWhile(() => currentSample < sampleCount, true)
    );
  }
}
