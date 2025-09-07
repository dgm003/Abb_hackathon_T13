import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DateRangeService, DateRangeRequest, DateRangeResponse, PeriodSummary, DailyData } from '../../services/date-range.service';

@Component({
  selector: 'app-date-ranges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-ranges.component.html',
  styleUrls: ['./date-ranges.component.css']
})
export class DateRangesComponent implements OnInit {
  // Date range inputs
  trainingStart: string = '2021-01-01';
  trainingEnd: string = '2021-01-03';
  testingStart: string = '2021-01-04';
  testingEnd: string = '2021-01-06';
  simulationStart: string = '2021-01-07';
  simulationEnd: string = '2021-01-09';

  // Validation state
  isValidating: boolean = false;
  validationResponse: DateRangeResponse | null = null;
  errorMessage: string = '';

  // Summary data
  periods: PeriodSummary[] = [];
  dailyData: DailyData[] = [];

  constructor(private dateRangeService: DateRangeService, private router: Router) { }

  ngOnInit(): void {
    // Don't auto-validate - wait for user to click button
  }

  onDateChange(): void {
    // Clear previous validation when dates change
    this.validationResponse = null;
    this.errorMessage = '';
  }

  validateRanges(): void {
    this.isValidating = true;
    this.errorMessage = '';

    const request: DateRangeRequest = {
      trainingStart: this.trainingStart,
      trainingEnd: this.trainingEnd,
      testingStart: this.testingStart,
      testingEnd: this.testingEnd,
      simulationStart: this.simulationStart,
      simulationEnd: this.simulationEnd
    };

    this.dateRangeService.validateDateRanges(request).subscribe({
      next: (response) => {
        console.log('Date range validation response:', response);
        console.log('Periods:', response.periods);
        console.log('Daily data:', response.dailyData);
        this.validationResponse = response;
        this.periods = response.periods;
        this.dailyData = response.dailyData;
        this.renderPlotly();
        this.isValidating = false;
      },
      error: (error) => {
        console.error('Date range validation error:', error);
        this.errorMessage = error.message || 'Failed to validate date ranges';
        this.isValidating = false;
      }
    });
  }

  private renderPlotly(): void {
    try {
      // @ts-ignore
      const PlotlyRef = (window as any).Plotly;
      if (!PlotlyRef) { return; }

      const dates = this.getJanuaryDates();
      const volumes = dates.map(d => this.getDailyVolume(d));
      const colors = dates.map(d => {
        const item = this.dailyData.find(x => x.date === d);
        switch (item?.periodType) {
          case 'Training': return '#4CAF50';
          case 'Testing': return '#FF9800';
          case 'Simulation': return '#2196F3';
          default: return '#9E9E9E';
        }
      });
      const hover = dates.map(d => {
        const item = this.dailyData.find(x => x.date === d);
        const label = item?.periodType ? item.periodType : 'Baseline';
        return `${this.formatDateForDisplay(d)} ${label}: ${this.getDailyVolume(d)} records`;
      });

      const data = [{
        x: dates.map(d => this.formatDateForDisplay(d)),
        y: volumes,
        type: 'bar',
        marker: { color: colors },
        hoverinfo: 'text',
        text: hover
      }];

      const layout = {
        margin: { l: 40, r: 10, t: 10, b: 40 },
        height: 320,
        yaxis: { title: 'Volume' },
        xaxis: { title: 'Timeline (January 2021)' },
        bargap: 0.2
      } as any;

      PlotlyRef.react('plotly-daily-bar', data, layout, { displayModeBar: false });
    } catch (e) {
      console.warn('Plotly render skipped:', e);
    }
  }

  proceedToNext(): void {
    if (this.validationResponse?.isValid) {
      // Navigate to next screen (Screen 3: Model Training)
      console.log('Proceeding to Model Training screen...');
      // TODO: Implement navigation to model training screen
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getPeriodColor(periodName: string): string {
    switch (periodName) {
      case 'Training Period': return '#4CAF50'; // Green
      case 'Testing Period': return '#FF9800'; // Orange
      case 'Simulation Period': return '#2196F3'; // Blue
      default: return '#9E9E9E'; // Gray
    }
  }

  getDailyVolume(date: string): number {
    const data = this.dailyData.find(d => d.date === date);
    const volume = data ? data.volume : 0;
    return volume;
  }

  getBarHeight(date: string): number {
    const volume = this.getDailyVolume(date);
    if (volume === 0) return 2; // Minimum height for visibility

    const volumes = this.dailyData.map(d => d.volume);
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);

    // Guard: if all equal, render a mid-height bar
    if (maxVolume === minVolume) {
      return 120; // constant mid-height
    }

    // Min–max scaling with a base so small differences still show
    const chartHeight = 180;           // px available for bars
    const base = 40;                   // px baseline so smallest value is still visible
    const range = Math.max(1, maxVolume - minVolume);
    const ratio = (volume - minVolume) / range; // 0..1
    return Math.max(2, Math.min(base + ratio * (chartHeight - base), chartHeight));
  }

  getDailyVolumeByPeriod(date: string, periodType: string): number {
    const data = this.dailyData.find(d => d.date === date && d.periodType === periodType);
    return data ? data.volume : 0;
  }

  getSegmentHeight(date: string, periodType: string): number {
    const totalVolume = this.getDailyVolume(date);
    const segmentVolume = this.getDailyVolumeByPeriod(date, periodType);
    if (totalVolume === 0) return 0;
    return (segmentVolume / totalVolume) * 100;
  }

  getJanuaryDates(): string[] {
    // Show only first 15 days on the x-axis
    const dates: string[] = [];
    for (let day = 1; day <= 15; day++) {
      dates.push(`2021-01-${day.toString().padStart(2, '0')}`);
    }
    return dates;
  }

  private getMaxVolume(): number {
    if (!this.dailyData || this.dailyData.length === 0) return 0;
    return Math.max(...this.dailyData.map(d => d.volume));
  }

  private getMinVolume(): number {
    if (!this.dailyData || this.dailyData.length === 0) return 0;
    return Math.min(...this.dailyData.map(d => d.volume));
  }

  getYAxisTicks(): number[] {
    const max = this.getMaxVolume();
    const min = this.getMinVolume();
    if (max === 0) return [0, 0, 0, 0, 0];
    if (max === min) return [min, min, min, min, min];
    const q1 = Math.round(min + (max - min) * 0.25);
    const q2 = Math.round(min + (max - min) * 0.5);
    const q3 = Math.round(min + (max - min) * 0.75);
    return [min, q1, q2, q3, max];
  }

  formatDateForDisplay(date: string): string {
    const d = new Date(date);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    return `${month} ${day}`;
  }
}
