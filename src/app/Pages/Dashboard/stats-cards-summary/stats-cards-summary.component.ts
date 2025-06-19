import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculatedStats } from '../../../shared/services/stats.service';

@Component({
  selector: 'app-stats-cards-summary',
  imports: [CommonModule],
  templateUrl: './stats-cards-summary.component.html',
})
export class StatsCardsSummaryComponent {
  @Input() stats: CalculatedStats | null = null;
  @Input() isLoading: boolean = false;
  Math = Math;

  getAccessiOggiPercentage(): number {
    if (!this.stats || this.stats.accessi_oggi === 0) {
      return 0;
    }
    return (this.stats.accessi_oggi / this.stats.totale_utenti) * 100;
  }

  getProgressPercentage(value: number, total: number): number {
    return Math.min((value || 0) / Math.max(total || 1, 1) * 100, 100);
  }

  getUserProgressPercentage(value: number): number {
    return this.getProgressPercentage(value, this.stats?.totale_utenti || 1);
  }

  getWeeklyProgressPercentage(): number {
    const weeklyMax = (this.stats?.totale_utenti || 1) * 7;
    return this.getProgressPercentage(this.stats?.accessi_settimana || 0, weeklyMax);
  }

  getYearlyProgressPercentage(): number {
    const yearlyMax = (this.stats?.totale_utenti || 1) * 365;
    return this.getProgressPercentage(this.stats?.accessi_anno || 0, yearlyMax);
  }
}
