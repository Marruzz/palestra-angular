import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PalestraUser, Corso, Abbonamento } from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent {
  @Input() user: PalestraUser | null = null;
  @Input() corsi: Corso[] = [];
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<PalestraUser>();

  onClose() {
    this.close.emit();
  }

  onEdit() {
    if (this.user) {
      this.edit.emit(this.user);
    }
  }

  getUserInitials(): string {
    if (!this.user) return '';
    return `${this.user.nome[0] || ''}${this.user.cognome[0] || ''}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  getCorsoName(idCorso: number): string {
    const corso = this.corsi.find(c => c.id === idCorso);
    return corso ? corso.nome_corso : 'Corso non trovato';
  }

  getAbbonamentoStatus(abbonamento: Abbonamento): 'active' | 'expired' | 'expiring' {
    const today = new Date();
    const dataFine = new Date(abbonamento.data_fine);
    const daysDiff = Math.ceil((dataFine.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (dataFine < today) {
      return 'expired';
    } else if (daysDiff <= 30) {
      return 'expiring';
    } else {
      return 'active';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'expiring':
        return 'In scadenza';
      case 'expired':
        return 'Scaduto';
      default:
        return 'Sconosciuto';
    }
  }

  getAge(): number {
    if (!this.user?.data_nascita) return 0;

    const birthDate = new Date(this.user.data_nascita);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  // Metodi per contare gli abbonamenti per stato
  getActiveAbbonamentiCount(): number {
    if (!this.user?.abbonamenti) return 0;
    return this.user.abbonamenti.filter(a => this.getAbbonamentoStatus(a) === 'active').length;
  }

  getExpiringAbbonamentiCount(): number {
    if (!this.user?.abbonamenti) return 0;
    return this.user.abbonamenti.filter(a => this.getAbbonamentoStatus(a) === 'expiring').length;
  }

  getExpiredAbbonamentiCount(): number {
    if (!this.user?.abbonamenti) return 0;
    return this.user.abbonamenti.filter(a => this.getAbbonamentoStatus(a) === 'expired').length;
  }
}
