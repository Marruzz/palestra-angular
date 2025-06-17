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
  selector: 'app-subscriptions-management',
  imports: [CommonModule],
  templateUrl: './subscriptions-management.component.html',
  styleUrl: './subscriptions-management.component.css'
})
export class SubscriptionsManagementComponent {
  @Input() subscriptions: Subscription[] = [];

  getActiveSubscriptionsByType(type: 'monthly' | 'quarterly' | 'yearly'): number {
    return this.subscriptions.filter(s => s.type === type && s.isActive).length;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'monthly': return 'Mensile';
      case 'quarterly': return 'Trimestrale';
      case 'yearly': return 'Annuale';
      default: return type;
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'monthly': return 'bg-green-100 text-green-800';
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'yearly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
