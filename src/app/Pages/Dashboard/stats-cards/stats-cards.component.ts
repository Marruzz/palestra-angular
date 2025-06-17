import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../../shared/services/dashboard.service';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
})
export class StatsCards {
  @Input() stats: DashboardStats | null = null;
  @Input() isLoading: boolean = false;
}
