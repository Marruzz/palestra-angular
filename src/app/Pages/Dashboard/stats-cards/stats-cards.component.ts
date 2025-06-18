import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalculatedStats } from '../../../shared/services/stats.service';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
})
export class StatsCards {
  @Input() stats: CalculatedStats | null = null;
  @Input() isLoading: boolean = false;
}
