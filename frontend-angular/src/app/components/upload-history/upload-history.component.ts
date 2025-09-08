import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

interface UploadHistoryItem {
  id: string;
  fileName: string;
  uploadDate: Date;
  fileSize: number;
  totalRecords: number;
  columnCount: number;
  passRate: number;
  dateRange: {
    start: string;
    end: string;
  };
}

@Component({
  selector: 'app-upload-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-history-container">
      <!-- Header -->
      <div class="header">
        <h1>MiniML - Predictive Quality Control</h1>
        <p class="subtitle">Upload History & Dataset Summary</p>
        <div class="abb-logo">ABB</div>
      </div>

      <!-- Navigation -->
      <div class="nav-section">
        <button class="nav-btn" (click)="goToUpload()">📁 Upload New Dataset</button>
        <button class="nav-btn" (click)="goToDateRanges()">📅 Date Ranges</button>
        <button class="nav-btn" (click)="goToModelTraining()">🤖 Model Training</button>
        <button class="nav-btn" (click)="goToSimulation()">⚡ Simulation</button>
      </div>

      <!-- Summary Stats -->
      <div class="summary-section">
        <h2>Dataset Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-value">{{ uploadHistory.length }}</div>
            <div class="summary-label">Total Uploads</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ getTotalRecords() | number }}</div>
            <div class="summary-label">Total Records</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ getAveragePassRate() | number:'1.1-1' }}%</div>
            <div class="summary-label">Avg Pass Rate</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">{{ getTotalFileSize() | number:'1.1-1' }} MB</div>
            <div class="summary-label">Total Size</div>
          </div>
        </div>
      </div>

      <!-- Upload History Table -->
      <div class="history-section">
        <h2>Upload History</h2>
        <div class="table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Upload Date</th>
                <th>File Size</th>
                <th>Records</th>
                <th>Columns</th>
                <th>Pass Rate</th>
                <th>Date Range</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of uploadHistory; trackBy: trackByFileName">
                <td class="file-name">{{ item.fileName }}</td>
                <td>{{ item.uploadDate | date:'short' }}</td>
                <td>{{ item.fileSize | number:'1.1-1' }} MB</td>
                <td>{{ item.totalRecords | number }}</td>
                <td>{{ item.columnCount }}</td>
                <td>
                  <span class="pass-rate" [class.high]="item.passRate > 80" [class.medium]="item.passRate > 60 && item.passRate <= 80" [class.low]="item.passRate <= 60">
                    {{ item.passRate | number:'1.1-1' }}%
                  </span>
                </td>
                <td>{{ item.dateRange.start }} - {{ item.dateRange.end }}</td>
                <td>
                  <button class="action-btn" (click)="selectDataset(item)">Select</button>
                  <button class="action-btn delete" (click)="deleteDataset(item.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="uploadHistory.length === 0">
        <div class="empty-icon">📊</div>
        <h3>No datasets uploaded yet</h3>
        <p>Upload your first dataset to get started with predictive quality control</p>
        <button class="primary" (click)="goToUpload()">Upload Dataset</button>
      </div>
    </div>
  `,
  styles: [`
    .upload-history-container { padding: 1.5rem; min-height: 100vh; }
    
    .header { text-align: center; margin-bottom: 2rem; }
    .header h1 { font-size: 2.5rem; margin: 0; color: #333; }
    .subtitle { color: #666; margin: 0.5rem 0; }
    .abb-logo { background: #1976d2; color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; font-weight: bold; }
    
    .nav-section { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap; }
    .nav-btn { background: #f5f5f5; border: 1px solid #ddd; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
    .nav-btn:hover { background: #e0e0e0; transform: translateY(-2px); }
    
    .summary-section { margin-bottom: 2rem; }
    .summary-section h2 { margin-bottom: 1rem; color: #333; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .summary-card { background: #fff; padding: 1.5rem; border-radius: 12px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .summary-value { font-size: 2rem; font-weight: bold; color: #1976d2; margin-bottom: 0.5rem; }
    .summary-label { color: #666; font-size: 0.9rem; }
    
    .history-section h2 { margin-bottom: 1rem; color: #333; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .history-table { width: 100%; border-collapse: collapse; }
    .history-table th { background: #f5f5f5; padding: 1rem; text-align: left; font-weight: 600; color: #333; border-bottom: 1px solid #ddd; }
    .history-table td { padding: 1rem; border-bottom: 1px solid #eee; }
    .history-table tr:hover { background: #f9f9f9; }
    .file-name { font-weight: 600; color: #1976d2; }
    .pass-rate { padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; }
    .pass-rate.high { background: #e8f5e9; color: #2e7d32; }
    .pass-rate.medium { background: #fff3e0; color: #f57c00; }
    .pass-rate.low { background: #ffebee; color: #c62828; }
    .action-btn { background: #1976d2; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; font-size: 0.8rem; }
    .action-btn.delete { background: #f44336; }
    .action-btn:hover { opacity: 0.8; }
    
    .empty-state { text-align: center; padding: 3rem; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state h3 { color: #333; margin-bottom: 0.5rem; }
    .empty-state p { color: #666; margin-bottom: 2rem; }
    .primary { background: #1976d2; color: white; border: none; padding: 0.8rem 2rem; border-radius: 6px; cursor: pointer; font-size: 1rem; }
    .primary:hover { background: #1565c0; }
    
    .dark-theme .header h1 { color: #ffffff; }
    .dark-theme .subtitle { color: #ffffff; }
    .dark-theme .summary-card { background: #1e1e1e; color: #ffffff; }
    .dark-theme .summary-value { color: #64b5f6; }
    .dark-theme .summary-label { color: #b0b0b0; }
    .dark-theme .table-container { background: #1e1e1e; }
    .dark-theme .history-table th { background: #2d2d2d; color: #ffffff; }
    .dark-theme .history-table td { color: #ffffff; }
    .dark-theme .history-table tr:hover { background: #2d2d2d; }
    .dark-theme .file-name { color: #64b5f6; }
    .dark-theme .empty-state h3 { color: #ffffff; }
    .dark-theme .empty-state p { color: #b0b0b0; }
  `]
})
export class UploadHistoryComponent implements OnInit {
  uploadHistory: UploadHistoryItem[] = [];

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUploadHistory();
  }

  private loadUploadHistory() {
    // Load from localStorage
    const history = localStorage.getItem('uploadHistory');
    if (history) {
      try {
        this.uploadHistory = JSON.parse(history).map((item: any) => ({
          ...item,
          uploadDate: new Date(item.uploadDate)
        }));
      } catch (error) {
        console.error('Error parsing upload history:', error);
        this.uploadHistory = [];
      }
    } else {
      this.uploadHistory = [];
    }
  }

  private saveUploadHistory() {
    localStorage.setItem('uploadHistory', JSON.stringify(this.uploadHistory));
  }

  getTotalRecords(): number {
    return this.uploadHistory.reduce((sum, item) => sum + item.totalRecords, 0);
  }

  getAveragePassRate(): number {
    if (this.uploadHistory.length === 0) return 0;
    const totalPassRate = this.uploadHistory.reduce((sum, item) => sum + item.passRate, 0);
    return totalPassRate / this.uploadHistory.length;
  }

  getTotalFileSize(): number {
    return this.uploadHistory.reduce((sum, item) => sum + item.fileSize, 0);
  }

  selectDataset(item: UploadHistoryItem) {
    // Store selected dataset and navigate to next step
    localStorage.setItem('selectedDataset', JSON.stringify(item));
    this.router.navigate(['/date-ranges']);
  }

  deleteDataset(id: string) {
    if (confirm('Are you sure you want to delete this dataset?')) {
      this.uploadHistory = this.uploadHistory.filter(item => item.id !== id);
      this.saveUploadHistory();
    }
  }

  trackByFileName(index: number, item: UploadHistoryItem): string {
    return item.fileName;
  }

  goToUpload() {
    this.router.navigate(['/upload']);
  }

  goToDateRanges() {
    this.router.navigate(['/date-ranges']);
  }

  goToModelTraining() {
    this.router.navigate(['/model-training']);
  }

  goToSimulation() {
    this.router.navigate(['/simulation']);
  }
}
