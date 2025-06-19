import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculatedStats } from '../../../shared/services/stats.service';
import { StatsCalculatorService } from '../../../shared/services/stats-calculator.service';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
})
export class StatsCards {
  @Input() stats: CalculatedStats | null = null;
  @Input() isLoading: boolean = false;
  constructor(private statsCalculator: StatsCalculatorService) {}

  getUsersPercentage(): number {
    return this.statsCalculator.getUsersPercentage(this.stats);
  }

  getActiveSubscriptionsPercentage(): number {
    return this.statsCalculator.getActiveSubscriptionsPercentage(this.stats);
  }

  getTodayAccessesPercentage(): number {
    return this.statsCalculator.getTodayAccessesPercentage(this.stats);
  }

  getWeekAccessesPercentage(): number {
    return this.statsCalculator.getWeekAccessesPercentage(this.stats);
  }

  getAllTimeAccessesPercentage(): number {
    return this.statsCalculator.getAllTimeAccessesPercentage();
  }

  getTodayUsersPercentage(): number {
    return this.statsCalculator.getTodayUsersPercentage(this.stats);
  }

  getMonthAccessesPercentage(): number {
    return this.statsCalculator.getMonthAccessesPercentage(this.stats);
  }

  getYearAccessesPercentage(): number {
    return this.statsCalculator.getYearAccessesPercentage(this.stats);
  }

  getActiveCoursesPercentage(): number {
    return this.statsCalculator.getActiveCoursesPercentage(this.stats);
  }

  getTotalSubscriptionsPercentage(): number {
    return this.statsCalculator.getTotalSubscriptionsPercentage(this.stats);
  }

  getAverageAgePercentage(): number {
    return this.statsCalculator.getAverageAgePercentage(this.stats);
  }

  getTopCoursePercentage(): number {
    return this.statsCalculator.getTopCoursePercentage();
  }

  getBottomCoursePercentage(): number {
    return this.statsCalculator.getBottomCoursePercentage();
  }

  getPeakTimePercentage(): number {
    return this.statsCalculator.getPeakTimePercentage(this.stats);
  }

  getAverageCourseDurationPercentage(): number {
    return this.statsCalculator.getAverageCourseDurationPercentage(this.stats);
  }
}
