import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-cards',
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrl: './stats-cards.component.css'
})
export class StatsCards {
  @Input() totalUsers: number = 0;
  @Input() activeUsers: number = 0;
  @Input() totalSubscriptions: number = 0;
  @Input() todayAccesses: number = 0;
  @Input() monthlyRevenue: number = 0;
  @Input() isLoading: boolean = false;
}
