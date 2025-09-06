import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface FileMetadata {
  totalRecords: number;
  totalColumns: number;
  passRate: number;
  dateRange: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentStep: number = 1;
  uploadedFile: File | null = null;
  fileMetadata: FileMetadata | null = null;
  isDragOver: boolean = false;
  isProcessing: boolean = false;
  
  // Screen 2: Date Ranges
  trainingStart: string = '';
  trainingEnd: string = '';
  testingStart: string = '';
  testingEnd: string = '';
  simulationStart: string = '';
  simulationEnd: string = '';
  dateRangesValid: boolean = false;
  dateValidationMessage: string = '';
  
  // Screen 3: Model Training
  modelTrained: boolean = false;
  trainingMetrics: any = null;
  isTraining: boolean = false;
  
  // Screen 4: Simulation
  simulationRunning: boolean = false;
  simulationComplete: boolean = false;
  simulationData: any[] = [];
  simulationStats: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Initialize component
    this.checkBackendHealth();
    this.testApiConnection();
  }

  checkBackendHealth() {
    console.log('Checking backend health...');
    // Always use localhost since browser accesses from localhost
    const backendUrl = 'http://localhost:8080';
    console.log('Using backend URL:', backendUrl);
    
    this.http.get(`${backendUrl}/api/data/health`).subscribe({
      next: (response: any) => {
        console.log('Backend is healthy:', response);
      },
      error: (error) => {
        console.error('Backend health check failed:', error);
        console.error('This might be why file upload is not working');
      }
    });
  }

  testApiConnection() {
    console.log('Testing API connection...');
    const backendUrl = 'http://localhost:8080';
    
    // Test if we can reach the backend
    this.http.get(`${backendUrl}/api/data/health`).subscribe({
      next: (response: any) => {
        console.log('✅ API connection successful:', response);
      },
      error: (error) => {
        console.error('❌ API connection failed:', error);
        console.error('This will prevent file upload from working');
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file: File) {
    console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      console.log('File validation failed - not a CSV file');
      alert('Please select a CSV file');
      return;
    }

    console.log('File validation passed, proceeding with upload');
    this.uploadedFile = file;
    this.uploadFile(file);
  }

  uploadFile(file: File) {
    this.isProcessing = true;
    const formData = new FormData();
    formData.append('file', file);

    // Always use localhost since browser accesses from localhost
    const backendUrl = 'http://localhost:8080';
    
    console.log('Starting file upload...', file.name);
    console.log('Uploading to:', `${backendUrl}/api/data/upload`);
    console.log('FormData contents:', formData);

    this.http.post(`${backendUrl}/api/data/upload`, formData, {
      headers: {
        'Accept': 'application/json'
      }
    }).subscribe({
      next: (response: any) => {
        console.log('Upload response received:', response);
        this.fileMetadata = {
          totalRecords: response.totalRecords || 0,
          totalColumns: response.totalColumns || 0,
          passRate: response.passRate || 0,
          dateRange: response.dateRange || ''
        };
        this.isProcessing = false;
        console.log('File uploaded successfully:', response);
        console.log('Metadata set:', this.fileMetadata);
        
        // Send dataset to ML service
        this.sendDatasetToML();
      },
      error: (error) => {
        this.isProcessing = false;
        this.uploadedFile = null; // Reset uploaded file on error
        console.error('Error uploading file:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        alert(`Error uploading file: ${error.status} - ${error.message}. Please check console for details.`);
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  nextStep() {
    console.log('Next step clicked, current step:', this.currentStep);
    
    // Validate current step before proceeding
    if (this.currentStep === 1) {
      if (!this.fileMetadata) {
        console.log('Cannot proceed: No file metadata available');
        alert('Please upload a file first');
        return;
      }
      console.log('Step 1 validation passed, proceeding to step 2');
    } else if (this.currentStep === 2) {
      if (!this.dateRangesValid) {
        console.log('Cannot proceed: Date ranges not validated');
        alert('Please validate date ranges first');
        return;
      }
      console.log('Step 2 validation passed, proceeding to step 3');
    } else if (this.currentStep === 3) {
      if (!this.modelTrained) {
        console.log('Cannot proceed: Model not trained');
        alert('Please train the model first');
        return;
      }
      console.log('Step 3 validation passed, proceeding to step 4');
    }
    
    if (this.currentStep < 4) {
      this.currentStep++;
      console.log('Moved to step:', this.currentStep);
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  downloadFile() {
    if (this.uploadedFile) {
      const url = URL.createObjectURL(this.uploadedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.uploadedFile.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  // Screen 2: Date Ranges
  validateDateRanges() {
    if (!this.trainingStart || !this.trainingEnd || !this.testingStart || !this.testingEnd || !this.simulationStart || !this.simulationEnd) {
      this.dateValidationMessage = 'Please select all date ranges';
      this.dateRangesValid = false;
      return;
    }

    const trainStart = new Date(this.trainingStart);
    const trainEnd = new Date(this.trainingEnd);
    const testStart = new Date(this.testingStart);
    const testEnd = new Date(this.testingEnd);
    const simStart = new Date(this.simulationStart);
    const simEnd = new Date(this.simulationEnd);

    if (trainStart > trainEnd || testStart > testEnd || simStart > simEnd) {
      this.dateValidationMessage = 'Start date must be before end date for each period';
      this.dateRangesValid = false;
      return;
    }

    if (testStart <= trainEnd) {
      this.dateValidationMessage = 'Testing period must begin after training period ends';
      this.dateRangesValid = false;
      return;
    }

    if (simStart <= testEnd) {
      this.dateValidationMessage = 'Simulation period must begin after testing period ends';
      this.dateRangesValid = false;
      return;
    }

    // Validate against dataset range (2021-01-01 to 2021-01-01 + records)
    const datasetStart = new Date('2021-01-01');
    const datasetEnd = new Date('2021-01-01');
    if (this.fileMetadata) {
      // Add seconds based on total records (1 second per record)
      datasetEnd.setSeconds(datasetEnd.getSeconds() + this.fileMetadata.totalRecords - 1);
    }

    if (trainStart < datasetStart || trainEnd > datasetEnd || 
        testStart < datasetStart || testEnd > datasetEnd ||
        simStart < datasetStart || simEnd > datasetEnd) {
      this.dateValidationMessage = `All dates must be within dataset range: ${datasetStart.toISOString().split('T')[0]} to ${datasetEnd.toISOString().split('T')[0]}`;
      this.dateRangesValid = false;
      return;
    }

    this.dateValidationMessage = 'Date ranges validated successfully!';
    this.dateRangesValid = true;
    console.log('Date ranges validated successfully');
  }

  // Screen 3: Model Training
  trainModel() {
    console.log('Starting model training...');
    console.log('Training data:', {
      trainStart: this.trainingStart,
      trainEnd: this.trainingEnd,
      testStart: this.testingStart,
      testEnd: this.testingEnd
    });
    
    this.isTraining = true;
    const trainingData = {
      trainStart: this.trainingStart,
      trainEnd: this.trainingEnd,
      testStart: this.testingStart,
      testEnd: this.testingEnd
    };

    this.http.post('http://localhost:8080/api/ml/train', trainingData).subscribe({
      next: (response: any) => {
        console.log('Training response received:', response);
        this.trainingMetrics = response;
        this.modelTrained = true;
        this.isTraining = false;
        console.log('Model training completed successfully');
      },
      error: (error) => {
        console.error('Model training failed:', error);
        console.error('Error details:', error.error);
        this.isTraining = false;
        alert(`Model training failed: ${error.status} - ${error.message}. Please check console for details.`);
      }
    });
  }

  // Screen 4: Simulation
  startSimulation() {
    this.simulationRunning = true;
    this.simulationComplete = false;
    this.simulationData = [];
    
    const simulationData = {
      simulationStart: this.simulationStart,
      simulationEnd: this.simulationEnd
    };

    this.http.post('http://localhost:8080/api/simulation/start', simulationData).subscribe({
      next: (response: any) => {
        this.simulationStats = response;
        this.simulationComplete = true;
        this.simulationRunning = false;
        console.log('Simulation completed:', response);
      },
      error: (error) => {
        console.error('Simulation failed:', error);
        this.simulationRunning = false;
        alert('Simulation failed. Please try again.');
      }
    });
  }

  restartSimulation() {
    this.simulationComplete = false;
    this.simulationData = [];
    this.simulationStats = null;
    this.startSimulation();
  }

  // Send dataset to ML service
  sendDatasetToML() {
    const backendUrl = 'http://localhost:8080';
    console.log('Sending dataset to ML service...');
    
    this.http.post(`${backendUrl}/api/data/send-dataset`, {}).subscribe({
      next: (response: any) => {
        console.log('Dataset sent to ML service successfully:', response);
      },
      error: (error) => {
        console.error('Error sending dataset to ML service:', error);
      }
    });
  }

  // Navigation
  goToStep(step: number) {
    if (step === 1 || (step === 2 && this.fileMetadata) || (step === 3 && this.dateRangesValid) || (step === 4 && this.modelTrained)) {
      this.currentStep = step;
    }
  }
}