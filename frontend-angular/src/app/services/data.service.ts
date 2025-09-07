import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DataSummary {
  fileName: string;
  totalRecords: number;
  totalColumns: number;
  passRate: number;
  earliestTimestamp: string;
  latestTimestamp: string;
  fileSize: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  dataSummary?: DataSummary;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8080/api/data';
  private mlUrl = 'http://localhost:8080/api/ml';

  constructor(private http: HttpClient) { }

  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  runMlPipeline(trainPath: string, testPath: string, simulatePath: string, targetColumn = 'Response'): Observable<any> {
    const payload = { trainPath, testPath, simulatePath, targetColumn };
    return this.http.post(`${this.mlUrl}/run`, payload)
      .pipe(
        catchError(this.handleError)
      );
  }

  train(trainPath: string, targetColumn = 'Response'): Observable<any> {
    return this.http.post(`${this.mlUrl}/train`, { trainPath, targetColumn })
      .pipe(catchError(this.handleError));
  }

  test(testPath: string, modelPath: string, scalerPath: string, targetColumn = 'Response'): Observable<any> {
    return this.http.post(`${this.mlUrl}/test`, { testPath, modelPath, scalerPath, targetColumn })
      .pipe(catchError(this.handleError));
  }

  simulate(simulatePath: string, modelPath: string, scalerPath: string): Observable<any> {
    return this.http.post(`${this.mlUrl}/simulate`, { simulatePath, modelPath, scalerPath })
      .pipe(catchError(this.handleError));
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
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
