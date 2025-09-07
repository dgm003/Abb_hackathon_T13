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
  private mockSampleCounter = 0; // Persistent counter for mock data

  constructor(private http: HttpClient) { }

  startSimulation(): Observable<SimulationData> {
    console.log('Starting simulation...');
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/start`, {})
      .pipe(
        switchMap((response) => {
          console.log('Simulation started:', response);
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

  resetSimulation(): void {
    this.mockSampleCounter = 0;
    console.log('Simulation counter reset to 0');
  }

  getCurrentCounter(): number {
    return this.mockSampleCounter;
  }

  private getNextPrediction(): Observable<SimulationData | null> {
    return this.http.get<SimulationData | null>(`${this.apiUrl}/next`)
      .pipe(
        catchError(() => of(null))
      );
  }

  private getMockSimulationData(): Observable<SimulationData> {
    // Generate mock simulation data with persistent counter
    const sampleCount = 20;
    console.log('Using mock simulation data, current counter:', this.mockSampleCounter);

    return interval(1000).pipe(
      map(() => {
        const now = new Date();
        // Format time manually to ensure proper seconds display
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;
        
        // Use persistent counter that doesn't reset
        this.mockSampleCounter++;
        const sampleId = `SAMPLE_${String(this.mockSampleCounter).padStart(3, '0')}`;
        console.log('Generated sample ID:', sampleId, 'Counter:', this.mockSampleCounter, 'Time:', time);
        
        // Generate realistic sensor data
        const temperature = 20 + Math.random() * 15; // 20-35°C
        const pressure = 1000 + Math.random() * 50; // 1000-1050 hPa
        const humidity = 40 + Math.random() * 40; // 40-80%
        
        // Generate prediction based on sensor values (simple logic)
        const baseScore = (temperature < 30 ? 0.6 : 0.4) + 
                         (pressure > 1020 ? 0.1 : 0) + 
                         (humidity < 70 ? 0.1 : 0);
        
        // Add more variation to get full range 1-100
        const variation = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
        const qualityScore = Math.max(0.01, Math.min(1.0, baseScore + variation));
        
        const prediction: 'Pass' | 'Fail' = qualityScore > 0.7 ? 'Pass' : 'Fail';
        const confidence = Math.round(qualityScore * 100);

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
      takeWhile((_, index) => index < sampleCount, true)
    );
  }
}
