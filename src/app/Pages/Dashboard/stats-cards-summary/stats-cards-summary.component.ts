import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculatedStats } from '../../../shared/services/stats.service';
import { StatsCalculatorService } from '../../../shared/services/stats-calculator.service';

@Component({
  selector: 'app-stats-cards-summary',
  imports: [CommonModule],
  templateUrl: './stats-cards-summary.component.html',
})
export class StatsCardsSummaryComponent {
  @Input() stats: CalculatedStats | null = null;
  @Input() isLoading: boolean = false;
  Math = Math;

  constructor(private statsCalculator: StatsCalculatorService) {}

  getAccessiOggiPercentage(): number {
    return this.statsCalculator.getTodayAccessesPercentage(this.stats);
  }

  getProgressPercentage(value: number, total: number): number {
    return this.statsCalculator.getProgressPercentage(value, total);
  }

  getUserProgressPercentage(value: number): number {
    return this.statsCalculator.getUserProgressPercentage(value, this.stats);
  }

  getWeeklyProgressPercentage(): number {
    return this.statsCalculator.getWeekAccessesPercentage(this.stats);
  }

  getYearlyProgressPercentage(): number {
    return this.statsCalculator.getYearAccessesPercentage(this.stats);
  }
}
