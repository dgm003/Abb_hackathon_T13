import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="app-container" [class.dark-theme]="currentTheme === 'dark'">
      <!-- Theme Toggle -->
      <div class="theme-toggle">
        <button 
          class="theme-toggle-btn" 
          (click)="toggleTheme()"
          [title]="currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'">
          {{ currentTheme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
      
      <!-- Main Content -->
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .theme-toggle {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }
    
    .theme-toggle-btn {
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #e0e0e0;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .theme-toggle-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    .dark-theme .theme-toggle-btn {
      background: rgba(45, 45, 45, 0.9);
      border-color: #555;
      color: #fff;
    }
    
    .dark-theme {
      background-color: #121212;
      color: #ffffff;
    }
    
    .dark-theme .card,
    .dark-theme .panel,
    .dark-theme .chart-card {
      background-color: #1e1e1e !important;
      border-color: #333 !important;
      color: #ffffff !important;
    }
    
    .dark-theme .metric-card {
      background: linear-gradient(135deg, #2d2d2d, #404040) !important;
    }
    
    .dark-theme .metadata-item {
      background-color: #2d2d2d !important;
      color: #ffffff !important;
    }
    
    .dark-theme .prediction-table th {
      background-color: #2d2d2d !important;
      color: #ffffff !important;
    }
    
    .dark-theme .prediction-table td {
      color: #ffffff !important;
    }
    
    .dark-theme .stat-card {
      background-color: #1e1e1e !important;
      color: #ffffff !important;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'MiniML - Predictive Quality Control';
  currentTheme: Theme = 'light';

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
