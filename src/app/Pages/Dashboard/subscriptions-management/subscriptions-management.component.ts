import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Abbonamento,
  PalestraUser,
  Corso,
} from '../../../shared/services/dashboard.service';
import { SubscriptionModalComponent } from './subscription-modal/subscription-modal.component';


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
  imports: [CommonModule, FormsModule, SubscriptionModalComponent],
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

  // Advanced filter functionality
  statusFilter: string = 'all'; // 'all', 'active', 'expired'
  typeFilter: string = 'all'; // 'all', 'monthly', 'semester', 'yearly'
  courseFilter: string = 'all'; // 'all' or specific course ID
  showFilters: boolean = false;

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
    if (months === 6) return 'Semestrale';
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

  get displayedSubscriptions(): Abbonamento[] {
    let filtered = this.subscriptions;

    // Apply search filter
    if (this.subscriptionSearchTerm.trim() !== '') {
      filtered = filtered.filter(subscription => {
        const userName = `${subscription.nome} ${subscription.cognome}`.toLowerCase();
        const courseName = (subscription.nome_corso || '').toLowerCase();
        const email = (subscription.email || '').toLowerCase();

        return userName.includes(this.subscriptionSearchTerm.toLowerCase()) ||
               courseName.includes(this.subscriptionSearchTerm.toLowerCase()) ||
               email.includes(this.subscriptionSearchTerm.toLowerCase());
      });
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(subscription => {
        const isActive = this.isSubscriptionActive(subscription);
        return this.statusFilter === 'active' ? isActive : !isActive;
      });
    }

    // Apply type filter
    if (this.typeFilter !== 'all') {
      const monthsMap = { 'monthly': 1, 'semester': 6, 'yearly': 12 };
      const targetMonths = monthsMap[this.typeFilter as keyof typeof monthsMap];
      filtered = filtered.filter(subscription => subscription.durata_mesi === targetMonths);
    }    // Apply course filter
    if (this.courseFilter !== 'all') {
      filtered = filtered.filter(subscription => subscription.id_corso?.toString() === this.courseFilter);
    }

    return filtered;
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
  }

  onTypeFilterChange(type: string): void {
    this.typeFilter = type;
  }

  onCourseFilterChange(courseId: string): void {
    this.courseFilter = courseId;
  }

  clearAllFilters(): void {
    this.statusFilter = 'all';
    this.typeFilter = 'all';
    this.courseFilter = 'all';
    this.subscriptionSearchTerm = '';
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.statusFilter !== 'all') count++;
    if (this.typeFilter !== 'all') count++;
    if (this.courseFilter !== 'all') count++;
    if (this.subscriptionSearchTerm.trim() !== '') count++;
    return count;
  }

  get uniqueCourses(): Corso[] {
    return this.corsi.filter((corso, index, self) =>
      index === self.findIndex(c => c.id === corso.id)
    );
  }
}
