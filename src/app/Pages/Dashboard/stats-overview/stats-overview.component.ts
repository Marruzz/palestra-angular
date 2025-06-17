import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfacce
interface Subscription {
  id: number;
  type: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  price: number;
  isActive: boolean;
}

@Component({
  selector: 'app-stats-overview',
  imports: [CommonModule],
  templateUrl: './stats-overview.component.html',
  styleUrl: './stats-overview.component.css'
})
export class StatsOverviewComponent {
  @Input() totalUsers: number = 0;
  @Input() activeUsers: number = 0;
  @Input() totalSubscriptions: number = 0;
  @Input() todayAccesses: number = 0;
  @Input() monthlyRevenue: number = 0;
  @Input() subscriptions: Subscription[] = [];

  getActiveSubscriptionsByType(type: 'monthly' | 'quarterly' | 'yearly'): number {
    return this.subscriptions.filter(s => s.type === type && s.isActive).length;
  }

  getRevenueByType(type: 'monthly' | 'quarterly' | 'yearly'): number {
    return this.subscriptions
      .filter(s => s.type === type && s.isActive)
      .reduce((sum, s) => sum + s.price, 0);
  }

  getInactiveUsersCount(): number {
    return this.totalUsers - this.activeUsers;
  }

  getActiveUsersPercentage(): number {
    if (this.totalUsers === 0) return 0;
    return Math.round((this.activeUsers / this.totalUsers) * 100);
  }
}
