import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Abbonamento, PalestraUser, Corso } from '../../../shared/services/dashboard.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions-management.component.html',
  styleUrl: './subscriptions-management.component.css'
})
export class SubscriptionsManagementComponent {
  @Input() subscriptions: Abbonamento[] = [];
  @Input() users: PalestraUser[] = [];
  @Input() corsi: Corso[] = [];
  @Input() showSubscriptionModal: boolean = false;
  @Input() subscriptionForm: any = {};
  @Input() selectedAbbonamento: Abbonamento | null = null;

  @Output() subscriptionModalOpen = new EventEmitter<Abbonamento>();
  @Output() subscriptionModalClose = new EventEmitter<void>();
  @Output() subscriptionSave = new EventEmitter<void>();
  @Output() subscriptionDelete = new EventEmitter<Abbonamento>();
  @Output() subscriptionFormChange = new EventEmitter<any>();
  getActiveSubscriptionsByType(type: 'monthly' | 'quarterly' | 'yearly'): number {
    // Map durata_mesi to subscription type
    const monthsMap = { 'monthly': 1, 'quarterly': 3, 'yearly': 12 };
    const targetMonths = monthsMap[type];
    return this.subscriptions.filter(s => s.durata_mesi === targetMonths).length;
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

  onOpenSubscriptionModal(abbonamento?: Abbonamento) {
    this.subscriptionModalOpen.emit(abbonamento);
  }

  onCloseSubscriptionModal() {
    this.subscriptionModalClose.emit();
  }

  onSaveSubscription() {
    this.subscriptionSave.emit();
  }

  onDeleteSubscription(abbonamento: Abbonamento) {
    this.subscriptionDelete.emit(abbonamento);
  }

  onFormChange() {
    this.subscriptionFormChange.emit(this.subscriptionForm);
  }

  getDurationLabel(months: number): string {
    if (months === 1) return 'Mensile';
    if (months === 3) return 'Trimestrale';
    if (months === 12) return 'Annuale';
    return `${months} mesi`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  calculatePrice(months: number): string {
    // Base price calculation - you can adjust these prices
    const monthlyPrice = 50;
    const totalPrice = monthlyPrice * months;
    return totalPrice.toFixed(2);
  }
}
