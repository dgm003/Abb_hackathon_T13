import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-model-training',
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
        <div class="step active"><div class="step-number">3</div><div class="step-label">Model Training</div></div>
        <div class="step"><div class="step-number">4</div><div class="step-label">Simulation</div></div>
        <div class="step-badge">Step 3 of 4</div>
      </div>

      <div class="main-content">
        <div class="section" style="margin-bottom:12px;">
          <div style="display:flex; justify-content: space-between; align-items:center;">
            <h2 style="margin:0;">Model Training</h2>
            <button class="primary-btn" (click)="startTraining()" [disabled]="isTraining || isTesting">{{ isTraining ? 'Training…' : 'Train Model' }}</button>
          </div>
          <div style="margin-top:8px; color:#666;">Status: <strong>{{ isTraining ? 'Training…' : (isTesting ? 'Testing…' : trainingStatus) }}</strong></div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:12px;">
            <button class="ghost-btn" (click)="goToSimulation()" [disabled]="!modelPath || !scalerPath">Go to Simulation ▶</button>
          </div>
        </div>
      </div>

      <div class="footer"><div class="footer-left">MiniML POC</div><div class="footer-right">ENGINEERED TO OUTRUN</div></div>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    .header { display: flex; align-items: center; justify-content: space-between; }
    .subtitle { color: #777; }
    .progress-steps { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
    .step { display: flex; align-items: center; gap: 8px; opacity: 0.6; }
    .step.active, .step.completed { opacity: 1; }
    .step-number { width: 24px; height: 24px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .step-badge { margin-left: auto; background: #f1f1f1; padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    .main-content { margin-top: 16px; }
    .section { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 16px; }
    .status-card { border: 1px solid #eee; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .action-btn { padding: 8px 12px; }
    .secondary-btn { padding: 10px 16px; }
    .metrics { background: #f8f9fa; padding: 12px; border-radius: 8px; max-height: 240px; overflow: auto; }
    .footer { margin-top: 20px; display: flex; justify-content: space-between; color: #666; font-size: 12px; }
  `]
})
export class ModelTrainingComponent {
  trainingStatus = 'Idle';
  testStatus = 'Idle';
  isTraining = false;
  isTesting = false;
  trainMetrics: any = null;
  testMetrics: any = null;
  modelPath: string | null = null;
  scalerPath: string | null = null;

  private readonly trainPath = '/app/data/preprocessed/train.csv';
  private readonly testPath = '/app/data/preprocessed/test.csv';

  constructor(private dataService: DataService, private router: Router) {}

  startTraining(): void {
    this.trainingStatus = 'Starting...';
    this.isTraining = true;
    this.trainMetrics = null;
    this.testMetrics = null;
    this.dataService.train(this.trainPath).subscribe({
      next: (res) => {
        this.trainingStatus = res.success ? 'Completed' : 'Failed';
        this.trainMetrics = res.metrics || null;
        this.modelPath = res.modelPath || res.model_path || null;
        this.scalerPath = res.scalerPath || res.scaler_path || null;
        this.isTraining = false;
        if (res.success && this.modelPath && this.scalerPath) {
          this.startTesting();
        }
      },
      error: (err) => {
        this.trainingStatus = 'Error';
        this.isTraining = false;
        this.trainMetrics = { error: String(err) };
      }
    });
  }

  private startTesting(): void {
    if (!this.modelPath || !this.scalerPath) return;
    this.testStatus = 'Starting...';
    this.isTesting = true;
    this.dataService.test(this.testPath, this.modelPath, this.scalerPath).subscribe({
      next: (res) => {
        this.testStatus = res.success ? 'Completed' : 'Failed';
        this.testMetrics = res.metrics || null;
        this.isTesting = false;
        if (res.success) {
          // Navigate automatically to simulation with artifacts and test metrics
          this.router.navigate(['/simulation'], { queryParams: { modelPath: this.modelPath, scalerPath: this.scalerPath }, state: { testMetrics: this.testMetrics } });
        }
      },
      error: (err) => {
        this.testStatus = 'Error';
        this.isTesting = false;
        this.testMetrics = { error: String(err) };
      }
    });
  }

  goToSimulation(): void {
    if (this.modelPath && this.scalerPath) {
      this.router.navigate(['/simulation'], { queryParams: { modelPath: this.modelPath, scalerPath: this.scalerPath } });
    }
  }
}
