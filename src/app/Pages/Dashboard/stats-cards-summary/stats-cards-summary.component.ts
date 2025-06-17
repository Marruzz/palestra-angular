import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../../shared/services/dashboard.service';

@Component({
  selector: 'app-stats-cards-summary',
  imports: [CommonModule],
  templateUrl: './stats-cards-summary.component.html',
})
export class StatsCardsSummary {
  @Input() stats: DashboardStats | null = null;
  @Input() isLoading: boolean = false;
}
