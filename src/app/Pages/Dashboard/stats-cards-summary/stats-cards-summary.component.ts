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
}
