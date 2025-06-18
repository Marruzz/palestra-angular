import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Abbonamento,
  PalestraUser,
  Corso,
} from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-subscription-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-modal.component.html',
  styleUrl: './subscription-modal.component.css',
})
export class SubscriptionModalComponent {
  @Input() selectedAbbonamento: Abbonamento | null = null;
  @Input() subscriptionForm: any = {};
  @Input() users: PalestraUser[] = [];
  @Input() corsi: Corso[] = [];

  @Output() subscriptionModalClose = new EventEmitter<void>();
  @Output() subscriptionSave = new EventEmitter<void>();
  @Output() subscriptionFormChange = new EventEmitter<any>();

  onCloseSubscriptionModal() {
    this.subscriptionModalClose.emit();
  }

  onSaveSubscription() {
    this.subscriptionSave.emit();
  }

  onFormChange() {
    this.subscriptionFormChange.emit(this.subscriptionForm);
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
        day: 'numeric',
      });
    } catch (error) {
      return 'Data non valida';
    }
  }
  getDurationLabel(months: number): string {
    if (months === 1) return 'Mensile';
    if (months === 6) return 'Semestrale';
    if (months === 12) return 'Annuale';
    return `${months} mesi`;
  }
  calculateEndDate(startDate: string, durationMonths: number): string {
    if (!startDate || !durationMonths) return '';

    const start = new Date(startDate);

    if (isNaN(start.getTime())) return '';

    const end = new Date(
      start.getFullYear(),
      start.getMonth() + durationMonths,
      start.getDate()
    );

    if (end.getDate() !== start.getDate()) {
      end.setDate(0); // Va all'ultimo giorno del mese precedente
    }

    return end.toISOString().split('T')[0];
  }

  getUserName(userId: number): string {
    const user = this.users.find((u) => u.id === userId);
    return user ? `${user.nome} ${user.cognome}` : 'Utente non trovato';
  }

  getCourseName(courseId: number): string {
    const course = this.corsi.find((c) => c.id === courseId);
    return course ? course.nome_corso : 'Corso non trovato';
  }

  calculatePrice(months: number): string {
    const monthlyPrice = 50;
    const totalPrice = monthlyPrice * months;
    return totalPrice.toFixed(2);
  }
  get currentEndDate(): string {
    if (
      this.subscriptionForm.data_inizio &&
      this.subscriptionForm.durata_mesi
    ) {
      const durationMonths = Number(this.subscriptionForm.durata_mesi);
      return this.calculateEndDate(
        this.subscriptionForm.data_inizio,
        durationMonths
      );
    }
    return '';
  }

  get currentPrice(): string {
    if (this.subscriptionForm.durata_mesi) {
      const durationMonths = Number(this.subscriptionForm.durata_mesi);
      return this.calculatePrice(durationMonths);
    }
    return '0.00';
  }

  get minDate(): string {
    if (!this.selectedAbbonamento) {
      return new Date().toISOString().split('T')[0];
    }
    return '';
  }
}
