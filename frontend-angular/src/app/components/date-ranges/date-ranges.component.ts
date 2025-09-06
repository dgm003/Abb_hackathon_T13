import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DateRangeService, DateRangeRequest, DateRangeResponse, PeriodSummary, MonthlyData } from '../../services/date-range.service';

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
  monthlyData: MonthlyData[] = [];

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
        console.log('Monthly data:', response.monthlyData);
        this.validationResponse = response;
        this.periods = response.periods;
        this.monthlyData = response.monthlyData;
        this.isValidating = false;
      },
      error: (error) => {
        console.error('Date range validation error:', error);
        this.errorMessage = error.message || 'Failed to validate date ranges';
        this.isValidating = false;
      }
    });
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

  getMonthlyVolume(month: string): number {
    const data = this.monthlyData.find(d => d.month === month);
    const volume = data ? data.volume : 0;
    console.log(`Volume for ${month}:`, volume);
    return volume;
  }

  getMonthlyPeriodType(month: string): string {
    const data = this.monthlyData.find(d => d.month === month);
    const periodType = data ? data.periodType : '';
    console.log(`Period type for ${month}:`, periodType);
    return periodType;
  }

  getBarHeight(month: string): number {
    const volume = this.getMonthlyVolume(month);
    if (volume === 0) return 2; // Minimum height for visibility
    
    // Scale the height to fit within the chart (max 180px)
    const maxVolume = Math.max(...this.monthlyData.map(d => d.volume));
    const height = Math.max(2, (volume / maxVolume) * 180);
    console.log(`Bar height for ${month}: ${height}px (volume: ${volume})`);
    return height;
  }

  getMonthlyVolumeByPeriod(month: string, periodType: string): number {
    const data = this.monthlyData.find(d => d.month === month && d.periodType === periodType);
    return data ? data.volume : 0;
  }

  getSegmentHeight(month: string, periodType: string): number {
    const totalVolume = this.getMonthlyVolume(month);
    const segmentVolume = this.getMonthlyVolumeByPeriod(month, periodType);
    
    if (totalVolume === 0) return 0;
    return (segmentVolume / totalVolume) * 100;
  }
}
