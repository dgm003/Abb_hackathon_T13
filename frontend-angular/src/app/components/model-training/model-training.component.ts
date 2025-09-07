import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MlService, TrainResponse } from '../../services/ml.service';

@Component({
  selector: 'app-model-training',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="training-wrapper">
      <div class="header-row">
        <h2>Model Training & Evaluation</h2>
        <span class="step">Step 3 of 4</span>
      </div>

      <!-- Pre-training state -->
      <div *ngIf="!trained && !loading" class="panel">
        <button class="primary" (click)="onTrain()">Train Model</button>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="panel loading">Training in progress...</div>

      <!-- Post-training state -->
      <div *ngIf="trained" class="results">
        <div class="status">✔ Model Trained</div>

        <div class="metrics-grid">
          <div class="metric-card gradient-1">
            <div class="value">{{ (metrics?.accuracy ?? 0) * 100 | number:'1.1-1' }}%</div>
            <div class="label">Accuracy</div>
          </div>
          <div class="metric-card gradient-2">
            <div class="value">{{ (metrics?.precision ?? 0) * 100 | number:'1.1-1' }}%</div>
            <div class="label">Precision</div>
          </div>
          <div class="metric-card gradient-3">
            <div class="value">{{ (metrics?.recall ?? 0) * 100 | number:'1.1-1' }}%</div>
            <div class="label">Recall</div>
          </div>
          <div class="metric-card gradient-4">
            <div class="value">{{ (metrics?.f1 ?? 0) * 100 | number:'1.1-1' }}%</div>
            <div class="label">F1-Score</div>
          </div>
        </div>

        <div class="charts">
          <div class="chart-card">
            <h3>Training Metrics</h3>
            <div id="plotly-train-curves" class="plotly-container"></div>
          </div>
          <div class="chart-card">
            <h3>Confusion Matrix</h3>
            <div id="plotly-confusion" class="plotly-container"></div>
          </div>
        </div>

        <div class="feature-importance-section">
          <div class="chart-card full-width">
            <h3>Feature Importance</h3>
            <div id="plotly-feature-importance" class="plotly-container"></div>
          </div>
        </div>

        <div class="model-metadata-section">
          <div class="chart-card full-width">
            <h3>Model Information</h3>
            <div class="metadata-grid">
              <div class="metadata-item">
                <span class="label">Model ID:</span>
                <span class="value">{{ metrics?.modelInfo?.modelId || 'N/A' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Version:</span>
                <span class="value">{{ metrics?.modelInfo?.version || 'N/A' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Algorithm:</span>
                <span class="value">{{ metrics?.modelInfo?.algorithm || 'N/A' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Training Samples:</span>
                <span class="value">{{ metrics?.modelInfo?.trainingSamples || 'N/A' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Test Samples:</span>
                <span class="value">{{ metrics?.modelInfo?.testSamples || 'N/A' }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Training Time:</span>
                <span class="value">{{ metrics?.modelInfo?.trainingTime || 'N/A' }}s</span>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-row">
          <button class="primary outline" (click)="onTrain()">Re-train</button>
          <button class="primary" [disabled]="!trained" (click)="goNext()">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .training-wrapper { padding: 1.5rem; }
    .header-row { display:flex; align-items:center; justify-content: space-between; margin-bottom: 1rem; }
    .step { background:#eef3ff; color:#3f51b5; padding: 0.25rem 0.5rem; border-radius: 6px; font-size:0.8rem; }
    .panel { background:#fff; border-radius:12px; padding:1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); }
    .loading { color:#555; }
    .primary { background:#3f51b5; color:#fff; border:0; border-radius:6px; padding:0.6rem 1rem; cursor:pointer; }
    .primary.outline { background:transparent; color:#3f51b5; border:1px solid #3f51b5; }
    .status { background:#e8f5e9; color:#2e7d32; border-left:4px solid #2e7d32; padding:0.5rem 0.75rem; border-radius:6px; margin: 1rem 0; font-weight:600; }
    .metrics-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
    .metric-card { color:#fff; border-radius:12px; padding:1rem; text-align:center; }
    .metric-card .value { font-size:1.6rem; font-weight:700; }
    .metric-card .label { opacity:0.85; margin-top:0.25rem; }
    .gradient-1 { background: linear-gradient(135deg,#6a11cb,#2575fc); }
    .gradient-2 { background: linear-gradient(135deg,#ff758c,#ff7eb3); }
    .gradient-3 { background: linear-gradient(135deg,#43cea2,#185a9d); }
    .gradient-4 { background: linear-gradient(135deg,#f7971e,#ffd200); color:#222; }
    .charts { display:grid; grid-template-columns: 2fr 1fr; gap:1rem; margin-top:1rem; }
    .chart-card { background:#fff; border-radius:12px; padding:1rem; box-shadow:0 4px 15px rgba(0,0,0,0.08); }
    .chart-card h3 { margin:0 0 1rem 0; font-size:1.1rem; font-weight:600; color:#333; }
    .chart-card.full-width { grid-column: 1 / -1; }
    .plotly-container { width:100%; height:320px; }
    .feature-importance-section { margin-top:1rem; }
    .model-metadata-section { margin-top:1rem; }
    .model-metadata-section h3 { margin-bottom:1rem; font-size:1.1rem; font-weight:600; color:#333; }
    .metadata-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; }
    .metadata-item { display:flex; justify-content:space-between; padding:0.5rem; background:#f8f9fa; border-radius:6px; }
    .metadata-item .label { font-weight:600; color:#666; }
    .metadata-item .value { color:#333; font-family:monospace; }
    .footer-row { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:1rem; }
  `]
})
export class ModelTrainingComponent {
  loading = false;
  trained = false;
  metrics: TrainResponse['metrics'] | null = null;

  constructor(private ml: MlService, private router: Router) {}

  onTrain(): void {
    this.loading = true;
    this.ml.train().subscribe(res => {
      this.loading = false;
      if (res.success) {
        this.trained = true;
        this.metrics = res.metrics;
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          this.renderCurves();
          this.renderConfusion();
          this.renderFeatureImportance();
        }, 100);
      }
    }, _ => { this.loading = false; });
  }

  private renderCurves(): void {
    // @ts-ignore
    const PlotlyRef = (window as any).Plotly; if (!PlotlyRef || !this.metrics) return;
    const epochs = Array.from({length: this.metrics.accCurve.length}, (_,i)=> i+1);
    const data = [
      { x: epochs, y: this.metrics.accCurve, type: 'scatter', mode: 'lines+markers', name: 'Training Accuracy', line: { color: '#2e7d32' } },
      { x: epochs, y: this.metrics.lossCurve, type: 'scatter', mode: 'lines+markers', name: 'Training Loss', yaxis: 'y2', line: { color: '#c62828' } }
    ];
    const layout = { height: 320, margin: { l:40,r:40,t:10,b:40 }, yaxis: { title:'Accuracy' }, yaxis2: { title:'Loss', overlaying:'y', side:'right' } } as any;
    PlotlyRef.react('plotly-train-curves', data, layout, { displayModeBar:false });
  }

  private renderConfusion(): void {
    // @ts-ignore
    const PlotlyRef = (window as any).Plotly; if (!PlotlyRef || !this.metrics) return;
    const { tp, tn, fp, fn } = this.metrics.confusion;
    const labels = ['True Positive','True Negative','False Positive','False Negative'];
    const values = [tp, tn, fp, fn];
    const colors = ['#2e7d32','#1565c0','#ef6c00','#c62828'];
    const data = [{ values, labels, type: 'pie', hole: .6, marker: { colors } }];
    const layout = { height: 320, margin: { l:10,r:10,t:10,b:10 } } as any;
    PlotlyRef.react('plotly-confusion', data, layout, { displayModeBar:false });
  }

  private renderFeatureImportance(): void {
    // @ts-ignore
    const PlotlyRef = (window as any).Plotly;
    if (!PlotlyRef) return;

    // Mock feature importance data with some randomization for re-training
    const features = [
      'Temperature', 'Pressure', 'Humidity', 'Vibration', 'Voltage',
      'Current', 'Speed', 'Torque', 'Flow Rate', 'Density'
    ];
    
    // Generate slightly different importance values each time for re-training effect
    const baseImportance = [0.25, 0.18, 0.15, 0.12, 0.10, 0.08, 0.06, 0.04, 0.02, 0.01];
    const importance = baseImportance.map(val => {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      return Math.max(0.01, val + variation);
    }).sort((a, b) => b - a); // Sort in descending order

    const data = [{
      x: importance,
      y: features,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: importance,
        colorscale: 'Viridis',
        showscale: true,
        colorbar: {
          title: 'Importance Score'
        }
      }
    }];

    const layout = {
      height: 400,
      margin: { l: 140, r: 40, t: 50, b: 60 },
      xaxis: { 
        title: 'Feature Importance Score',
        titlefont: { size: 12 }
      },
      yaxis: { 
        title: 'Features',
        titlefont: { size: 12 }
      },
      title: {
        text: 'Top 10 Most Important Features',
        font: { size: 16 },
        x: 0.5,
        xanchor: 'center'
      },
      showlegend: false
    };

    PlotlyRef.react('plotly-feature-importance', data, layout, { displayModeBar: false });
  }

  goNext(): void {
    this.router.navigate(['/simulation']);
  }
}
