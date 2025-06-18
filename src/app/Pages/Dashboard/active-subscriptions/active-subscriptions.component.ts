import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Abbonamento, PalestraUser, Corso } from '../../../shared/services/dashboard.service';

@Component({
  selector: 'app-active-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './active-subscriptions.component.html',
  styleUrls: ['./active-subscriptions.component.css']
})
export class ActiveSubscriptionsComponent {
  @Input() abbonamenti: Abbonamento[] = [];
  @Input() users: PalestraUser[] = [];
  @Input() corsi: Corso[] = [];
  @Input() showSubscriptionModal = false;
  @Input() subscriptionForm: any = {};
  @Input() selectedAbbonamento: Abbonamento | null = null;
  @Input() isLoading = false;
  @Input() errorMessage = '';

  @Output() subscriptionModalOpen = new EventEmitter<Abbonamento | null>();
  @Output() subscriptionModalClose = new EventEmitter<void>();
  @Output() subscriptionSave = new EventEmitter<void>();
  @Output() subscriptionRenew = new EventEmitter<Abbonamento>();
  @Output() subscriptionCancel = new EventEmitter<Abbonamento>();
  @Output() refreshView = new EventEmitter<void>();

  getActiveSubscriptions(): Abbonamento[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.abbonamenti.filter(abbonamento => {
      const dataFine = new Date(abbonamento.data_fine);
      dataFine.setHours(0, 0, 0, 0);
      return dataFine >= today;
    });
  }

  getExpiringSubscriptions(): Abbonamento[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inSevenDays = new Date(today);
    inSevenDays.setDate(today.getDate() + 7);

    return this.getActiveSubscriptions().filter(abbonamento => {
      const dataFine = new Date(abbonamento.data_fine);
      dataFine.setHours(0, 0, 0, 0);
      return dataFine <= inSevenDays;
    });
  }

  getDaysUntilExpiry(abbonamento: Abbonamento): number {
    const today = new Date();
    const dataFine = new Date(abbonamento.data_fine);
    return Math.ceil((dataFine.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  getStatusColor(abbonamento: Abbonamento): string {
    const daysUntilExpiry = this.getDaysUntilExpiry(abbonamento);
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800';
    if (daysUntilExpiry <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  }

  openSubscriptionModal(abbonamento?: Abbonamento) {
    this.subscriptionModalOpen.emit(abbonamento || null);
  }

  closeSubscriptionModal() {
    this.subscriptionModalClose.emit();
  }

  saveSubscription() {
    this.subscriptionSave.emit();
  }

  renewSubscription(abbonamento: Abbonamento) {
    this.subscriptionRenew.emit(abbonamento);
  }

  cancelSubscription(abbonamento: Abbonamento) {
    this.subscriptionCancel.emit(abbonamento);
  }

  refreshData() {
    this.refreshView.emit();
  }
}
