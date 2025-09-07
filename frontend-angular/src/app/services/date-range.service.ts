import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DateRangeRequest {
  trainingStart: string;
  trainingEnd: string;
  testingStart: string;
  testingEnd: string;
  simulationStart: string;
  simulationEnd: string;
}

export interface PeriodSummary {
  periodName: string;
  startDate: string;
  endDate: string;
  durationInDays: number;
  recordCount: number;
}

export interface DailyData {
  date: string; // Format: "2021-01-01"
  day: string; // Format: "Jan 1"
  volume: number;
  periodType: string;
}

export interface DateRangeResponse {
  isValid: boolean;
  message: string;
  periods: PeriodSummary[];
  dailyData: DailyData[];
}

@Injectable({
  providedIn: 'root'
})
export class DateRangeService {
  private apiUrl = 'http://localhost:8080/api/daterange'; // Backend API URL

  constructor(private http: HttpClient) { }

  validateDateRanges(request: DateRangeRequest): Observable<DateRangeResponse> {
    return this.http.post<DateRangeResponse>(`${this.apiUrl}/validate`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
