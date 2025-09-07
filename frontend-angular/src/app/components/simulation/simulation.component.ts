import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-simulation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>MiniML - Predictive Quality Control</h1>
        <p class="subtitle">Simplified Frontend</p>
        <div class="abb-logo">ABB</div>
      </div>

      <div class="progress-steps">
        <div class="step completed"><div class="step-number">1</div><div class="step-label">Upload Dataset</div></div>
        <div class="step completed"><div class="step-number">2</div><div class="step-label">Date Ranges</div></div>
        <div class="step completed"><div class="step-number">3</div><div class="step-label">Model Training</div></div>
        <div class="step active"><div class="step-number">4</div><div class="step-label">Simulation</div></div>
        <div class="step-badge">Step 4 of 4</div>
      </div>

      <div class="main-content">
        <div class="section" style="margin-bottom:12px;">
          <div style="display:flex; justify-content: space-between; align-items:center;">
            <h2 style="margin:0;">Model Training & Evaluation</h2>
            <button class="primary-btn" (click)="startSimulation()" [disabled]="running">{{ running ? 'Simulating…' : 'Run Simulation' }}</button>
          </div>
        </div>

        <div class="section">
          <div class="metrics-grid">
            <div class="metric-card metric-blue">
              <h4>Accuracy</h4>
              <div class="value">{{ testMetrics?.accuracy || 0 }}%</div>
            </div>
            <div class="metric-card metric-pink">
              <h4>Precision</h4>
              <div class="value">{{ testMetrics?.precision || 0 }}%</div>
            </div>
            <div class="metric-card metric-cyan">
              <h4>Recall</h4>
              <div class="value">{{ testMetrics?.recall || 0 }}%</div>
            </div>
            <div class="metric-card metric-green">
              <h4>F1 Score</h4>
              <div class="value">{{ testMetrics?.f1_score || 0 }}%</div>
            </div>
          </div>
        </div>

        <div class="section" style="margin-top:12px;">
          <div class="chart-card">
            <div class="chart-header">Training Metrics</div>
            <div class="chart-placeholder"></div>
          </div>
        </div>

        <div class="section" style="margin-top:12px;">
          <div class="chart-card">
            <div class="chart-header">Model Performance</div>
            <div class="chart-placeholder"></div>
          </div>
          <pre *ngIf="predictions.length" class="metrics" style="margin-top:8px;">Predictions (first 50): {{ predictions.slice(0,50) | json }}</pre>
        </div>
      </div>

      <div class="footer"><div class="footer-left">MiniML POC</div><div class="footer-right">ENGINEERED TO OUTRUN</div></div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .header { display: flex; align-items: center; justify-content: space-between; }
    .progress-steps { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .step { display: flex; align-items: center; gap: 8px; opacity: 0.6; }
    .step.active, .step.completed { opacity: 1; }
    .step-number { width: 24px; height: 24px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .step-badge { margin-left: auto; background: #f1f1f1; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    .section { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 16px; }
    .action-btn { padding: 8px 12px; }
    .metrics { background: #f8f9fa; padding: 12px; border-radius: 8px; max-height: 240px; overflow: auto; }
  `]
})
export class SimulationComponent {
  status = 'Idle';
  running = false;
  predictions: number[] = [];
  modelPath: string | null = null;
  scalerPath: string | null = null;
  testMetrics: any = null;
  private readonly simulatePath = '/app/data/preprocessed/simulate.csv';

  constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {
    this.route.queryParams.subscribe(params => {
      this.modelPath = params['modelPath'] || null;
      this.scalerPath = params['scalerPath'] || null;
    });
    const nav = this.router.getCurrentNavigation();
    this.testMetrics = nav?.extras?.state?.['testMetrics'] || null;
  }

  startSimulation(): void {
    if (!this.modelPath || !this.scalerPath) {
      this.status = 'Model artifacts missing';
      return;
    }
    this.running = true;
    this.status = 'Running...';
    this.dataService.simulate(this.simulatePath, this.modelPath, this.scalerPath).subscribe({
      next: (res) => {
        this.running = false;
        this.status = res.success ? 'Completed' : 'Failed';
        this.predictions = res.predictions || [];
      },
      error: (err) => {
        this.running = false;
        this.status = 'Error';
      }
    });
  }
}
