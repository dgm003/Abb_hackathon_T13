import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SimulationService, SimulationData, SimulationStats } from '../../services/simulation.service';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simulation-wrapper">
      <div class="header-row">
        <h2>Real-Time Prediction Simulation</h2>
        <span class="step">Step 4 of 4</span>
      </div>

      <!-- Simulation Control -->
      <div class="simulation-control">
        <div class="control-buttons">
          <button 
            class="primary" 
            [disabled]="isRunning" 
            (click)="startSimulation()"
            *ngIf="!isRunning && !isCompleted">
            Start Simulation
          </button>
          
          <button 
            class="primary pause" 
            (click)="pauseSimulation()"
            *ngIf="isRunning && !isPaused">
            ⏸️ Pause
          </button>
          
          <button 
            class="primary resume" 
            (click)="resumeSimulation()"
            *ngIf="isPaused">
            ▶️ Resume
          </button>
          
          <button 
            class="primary stop" 
            (click)="stopSimulation()"
            *ngIf="isRunning || isPaused">
            ⏹️ Stop
          </button>
          
          <button 
            class="primary" 
            (click)="restartSimulation()"
            *ngIf="isCompleted">
            🔄 Restart
          </button>
        </div>
        
        <div class="simulation-status" *ngIf="isCompleted">
          <span class="status-icon">✔</span>
          <span class="status-text">Simulation completed!</span>
        </div>
        
        <div class="simulation-status paused" *ngIf="isPaused">
          <span class="status-icon">⏸️</span>
          <span class="status-text">Simulation paused</span>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>Real-Time Quality Predictions</h3>
          <div id="plotly-quality-chart" class="plotly-container"></div>
        </div>
        <div class="chart-card">
          <h3>Prediction Confidence</h3>
          <div id="plotly-confidence-chart" class="plotly-container"></div>
        </div>
      </div>

      <!-- Live Statistics -->
      <div class="stats-section">
        <h3>Live Statistics</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">TOTAL</div>
          </div>
          <div class="stat-card fail">
            <div class="stat-value">{{ stats.fail }}</div>
            <div class="stat-label">FAIL</div>
          </div>
          <div class="stat-card pass">
            <div class="stat-value">{{ stats.pass }}</div>
            <div class="stat-label">PASS</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.avgConfidence }}%</div>
            <div class="stat-label">AVG CONF.</div>
          </div>
        </div>
      </div>

      <!-- Live Prediction Stream -->
      <div class="stream-section">
        <h3>Live Prediction Stream</h3>
        <div class="table-container">
          <table class="prediction-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>SAMPLE ID</th>
                <th>PREDICTION</th>
                <th>CONFIDENCE</th>
                <th>TEMPERATURE</th>
                <th>PRESSURE</th>
                <th>HUMIDITY</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prediction of predictions; trackBy: trackByTime">
                <td>{{ prediction.time }}</td>
                <td>{{ prediction.sampleId }}</td>
                <td>
                  <span class="prediction-badge" [class.pass]="prediction.prediction === 'Pass'" [class.fail]="prediction.prediction === 'Fail'">
                    {{ prediction.prediction }}
                  </span>
                </td>
                <td>{{ prediction.confidence }}%</td>
                <td>{{ prediction.temperature }}°C</td>
                <td>{{ prediction.pressure }} hPa</td>
                <td>{{ prediction.humidity }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Export Section -->
      <div class="export-section">
        <div class="export-controls">
          <button class="primary outline" (click)="exportLogs()" [disabled]="predictions.length === 0">
            📊 Export Logs (CSV)
          </button>
          <button class="primary outline" (click)="exportLogsJSON()" [disabled]="predictions.length === 0">
            📄 Export Logs (JSON)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simulation-wrapper { padding: 1.5rem; }
    .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .step { background: #eef3ff; color: #3f51b5; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.8rem; }
    
    .simulation-control { text-align: center; margin-bottom: 2rem; }
    .control-buttons { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
    .primary { background: #3f51b5; color: #fff; border: 0; border-radius: 6px; padding: 0.8rem 1.5rem; cursor: pointer; font-size: 1rem; }
    .primary:disabled { background: #ccc; cursor: not-allowed; }
    .primary.pause { background: #ff9800; }
    .primary.resume { background: #4caf50; }
    .primary.stop { background: #f44336; }
    .simulation-status { margin-top: 1rem; }
    .simulation-status.paused { color: #ff9800; }
    .status-icon { font-weight: bold; margin-right: 0.5rem; }
    .status-text { font-weight: 600; }
    
    .charts-section { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 2rem; }
    .chart-card { background: #fff; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
    .chart-card h3 { margin: 0 0 1rem 0; color: #333; }
    .plotly-container { width: 100%; height: 300px; }
    
    .stats-section { margin-bottom: 2rem; }
    .stats-section h3 { margin-bottom: 1rem; color: #333; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .stat-card { background: #fff; border-radius: 8px; padding: 1rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .stat-card.pass { border-left: 4px solid #2e7d32; }
    .stat-card.fail { border-left: 4px solid #c62828; }
    .stat-value { font-size: 2rem; font-weight: bold; color: #333; }
    .stat-label { color: #666; font-size: 0.9rem; margin-top: 0.25rem; }
    
    .stream-section h3 { margin-bottom: 1rem; color: #333; }
    .table-container { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-height: 400px; overflow-y: auto; }
    .prediction-table { width: 100%; border-collapse: collapse; }
    .prediction-table th { background: #f5f5f5; padding: 0.75rem; text-align: left; font-weight: 600; color: #333; border-bottom: 1px solid #ddd; }
    .prediction-table td { padding: 0.75rem; border-bottom: 1px solid #eee; }
    .prediction-table tr:hover { background: #f9f9f9; }
    .prediction-badge { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .prediction-badge.pass { background: #e8f5e9; color: #2e7d32; }
    .prediction-badge.fail { background: #ffebee; color: #c62828; }
    
    .export-section { margin-top: 2rem; }
    .export-controls { display: flex; gap: 1rem; justify-content: center; }
  `]
})
export class SimulationComponent implements OnInit, OnDestroy {
  isRunning = false;
  isCompleted = false;
  isPaused = false;
  predictions: SimulationData[] = [];
  stats: SimulationStats = { total: 0, pass: 0, fail: 0, avgConfidence: 0 };
  private simulationInterval: any;
  private simulationSubscription: Subscription | null = null;
  private qualityChartData: any[] = [];
  private confidenceChartData: any[] = [];
  private pausedPredictions: SimulationData[] = [];
  private pausedStats: SimulationStats = { total: 0, pass: 0, fail: 0, avgConfidence: 0 };

  constructor(
    private simulationService: SimulationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeCharts();
  }

  ngOnDestroy() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
    }
  }

  startSimulation() {
    this.isRunning = true;
    this.isCompleted = false;
    this.isPaused = false;
    this.predictions = [];
    this.stats = { total: 0, pass: 0, fail: 0, avgConfidence: 0 };
    this.qualityChartData = [];
    this.confidenceChartData = [];

    // Reset the simulation counter when starting fresh
    this.simulationService.resetSimulation();

    this.simulationSubscription = this.simulationService.startSimulation().subscribe({
      next: (data) => {
        if (!this.isPaused) {
          this.predictions.unshift(data); // Add to beginning for newest first
          this.updateStats(data);
          this.updateCharts(data);
          
          // Keep only last 20 predictions for performance and real-time feel
          if (this.predictions.length > 20) {
            this.predictions = this.predictions.slice(0, 20);
          }
          
          // Keep only last 20 data points for chart
          if (this.qualityChartData.length > 20) {
            this.qualityChartData = this.qualityChartData.slice(-20);
          }
        }
      },
      complete: () => {
        this.isRunning = false;
        this.isCompleted = true;
        this.isPaused = false;
        this.simulationSubscription = null;
      },
      error: (error) => {
        console.error('Simulation error:', error);
        this.isRunning = false;
        this.simulationSubscription = null;
      }
    });
  }

  restartSimulation() {
    // Stop current simulation if running
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
      this.simulationSubscription = null;
    }
    this.startSimulation();
  }

  pauseSimulation() {
    this.isPaused = true;
    this.pausedPredictions = [...this.predictions];
    this.pausedStats = { ...this.stats };
    // Note: We don't unsubscribe here, just pause the data processing
  }

  resumeSimulation() {
    this.isPaused = false;
    this.predictions = [...this.pausedPredictions];
    this.stats = { ...this.pausedStats };
    // Don't reset the simulation counter when resuming
  }

  stopSimulation() {
    // Unsubscribe from the simulation to stop it completely
    if (this.simulationSubscription) {
      this.simulationSubscription.unsubscribe();
      this.simulationSubscription = null;
    }
    
    this.isRunning = false;
    this.isPaused = false;
    this.isCompleted = false;
    this.predictions = [];
    this.stats = { total: 0, pass: 0, fail: 0, avgConfidence: 0 };
    this.qualityChartData = [];
    this.confidenceChartData = [];
    this.pausedPredictions = [];
    this.pausedStats = { total: 0, pass: 0, fail: 0, avgConfidence: 0 };
    
    // Reset the simulation counter
    this.simulationService.resetSimulation();
  }

  private updateStats(data: SimulationData) {
    this.stats.total++;
    if (data.prediction === 'Pass') {
      this.stats.pass++;
    } else {
      this.stats.fail++;
    }
    
    // Calculate average confidence
    const totalConfidence = this.predictions.reduce((sum, p) => sum + p.confidence, 0);
    this.stats.avgConfidence = Math.round(totalConfidence / this.predictions.length);
  }

  private updateCharts(data: SimulationData) {
    // Update quality chart
    this.qualityChartData.push({
      x: data.time,
      y: data.confidence
    });

    // Update confidence donut chart
    this.confidenceChartData = [
      { label: 'Pass', value: this.stats.pass, color: '#2e7d32' },
      { label: 'Fail', value: this.stats.fail, color: '#c62828' }
    ];

    this.renderCharts();
  }

  private initializeCharts() {
    this.renderCharts();
  }

  private renderCharts() {
    // @ts-ignore
    const PlotlyRef = (window as any).Plotly;
    if (!PlotlyRef) return;

    // Quality predictions line chart
    const qualityData = [{
      x: this.qualityChartData.map(d => d.x),
      y: this.qualityChartData.map(d => d.y),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Quality Score',
      line: { color: '#3f51b5' },
      marker: { size: 4 }
    }];

    // Fixed Y-axis range from 0 to 100
    const yRange = [0, 100];

    const qualityLayout = {
      height: 300,
      margin: { l: 50, r: 20, t: 20, b: 40 },
      xaxis: { 
        title: 'Time',
        type: 'category',
        autorange: true
      },
      yaxis: { 
        title: 'Quality Score', 
        range: yRange,
        fixedrange: false,
        autorange: false
      },
      showlegend: true
    };

    PlotlyRef.react('plotly-quality-chart', qualityData, qualityLayout, { displayModeBar: false });

    // Confidence donut chart
    const confidenceData = [{
      values: this.confidenceChartData.map(d => d.value),
      labels: this.confidenceChartData.map(d => d.label),
      type: 'pie',
      hole: 0.6,
      marker: { colors: this.confidenceChartData.map(d => d.color) }
    }];

    const confidenceLayout = {
      height: 300,
      margin: { l: 10, r: 10, t: 20, b: 10 },
      showlegend: true
    };

    PlotlyRef.react('plotly-confidence-chart', confidenceData, confidenceLayout, { displayModeBar: false });
  }

  trackByTime(index: number, prediction: SimulationData): string {
    return prediction.time;
  }

  exportLogs(): void {
    if (this.predictions.length === 0) return;

    const csvContent = this.generateCSV();
    this.downloadFile(csvContent, 'simulation_logs.csv', 'text/csv');
  }

  exportLogsJSON(): void {
    if (this.predictions.length === 0) return;

    const jsonContent = JSON.stringify({
      exportDate: new Date().toISOString(),
      totalPredictions: this.predictions.length,
      statistics: this.stats,
      predictions: this.predictions
    }, null, 2);

    this.downloadFile(jsonContent, 'simulation_logs.json', 'application/json');
  }

  private generateCSV(): string {
    const headers = ['Time', 'Sample ID', 'Prediction', 'Confidence', 'Temperature', 'Pressure', 'Humidity'];
    const csvRows = [headers.join(',')];

    this.predictions.forEach(prediction => {
      const row = [
        prediction.time,
        prediction.sampleId,
        prediction.prediction,
        prediction.confidence,
        prediction.temperature,
        prediction.pressure,
        prediction.humidity
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
