import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Abbonamento,
  PalestraUser,
  Corso,
} from '../../../shared/services/dashboard.service';


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
  styleUrl: './subscriptions-management.component.css',
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

  // Search functionality
  subscriptionSearchTerm: string = '';
  filteredSubscriptions: Abbonamento[] = [];

  getActiveSubscriptionsByType(
    type: 'monthly' | 'semester' | 'yearly'
  ): number {

    const monthsMap = { monthly: 1, semester: 6, yearly: 12 };
    const targetMonths = monthsMap[type];
    return this.subscriptions.filter((s) => s.durata_mesi === targetMonths)
      .length;
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'monthly':
        return 'Mensile';
      case 'semester':
        return 'Semestrale';
      case 'yearly':
        return 'Annuale';
      default:
        return type;
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'monthly':
        return 'bg-green-100 text-green-800';
      case 'quarterly':
        return 'bg-blue-100 text-blue-800';
      case 'yearly':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data non valida';
      }
      return date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Data non valida';
    }
  }

  calculatePrice(months: number): string {

    const monthlyPrice = 50;
    const totalPrice = monthlyPrice * months;
    return totalPrice.toFixed(2);
  }

  getCourseName(subscription: Abbonamento): string {
    return subscription.nome_corso || 'Corso non disponibile';
  }

  isSubscriptionActive(subscription: Abbonamento): boolean {
    const today = new Date();
    const endDate = new Date(subscription.data_fine);
    return endDate >= today;
  }

  getSubscriptionStatusText(subscription: Abbonamento): string {
    return this.isSubscriptionActive(subscription) ? 'Attivo' : 'Scaduto';
  }

  getSubscriptionStatusClass(subscription: Abbonamento): string {
    return this.isSubscriptionActive(subscription)
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  onSubscriptionSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.subscriptionSearchTerm = target.value.toLowerCase();

    if (this.subscriptionSearchTerm.trim() === '') {
      this.filteredSubscriptions = [];
    } else {
      this.filteredSubscriptions = this.subscriptions.filter(subscription => {
        const userName = `${subscription.nome} ${subscription.cognome}`.toLowerCase();
        const courseName = (subscription.nome_corso || '').toLowerCase();
        const email = (subscription.email || '').toLowerCase();

        return userName.includes(this.subscriptionSearchTerm) ||
               courseName.includes(this.subscriptionSearchTerm) ||
               email.includes(this.subscriptionSearchTerm);
      });
    }
  }

  get displayedSubscriptions(): Abbonamento[] {
    return this.subscriptionSearchTerm ? this.filteredSubscriptions : this.subscriptions;
  }
}
