import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  PalestraUser,
  Corso,
  Abbonamento,
} from '../../../../shared/services/dashboard.service';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css',
})
export class UserCardComponent {
  @Input() user: PalestraUser | null = null;
  @Input() corsi: Corso[] = [];
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<PalestraUser>();

  constructor(
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService
  ) {}

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

  getCorsoName(idCorso: number): string {
    const corso = this.corsi.find((c) => c.id === idCorso);
    return corso ? corso.nome_corso : 'Corso non trovato';
  }

  getAbbonamentoStatus(
    abbonamento: Abbonamento
  ): 'active' | 'expired' | 'expiring' {
    const today = new Date();
    const dataFine = new Date(abbonamento.data_fine);
    const daysDiff = Math.ceil(
      (dataFine.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

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

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }


  getActiveAbbonamentiCount(): number {
    if (!this.user?.abbonamenti) return 0;
    return this.user.abbonamenti.filter(
      (a) => this.getAbbonamentoStatus(a) === 'active'
    ).length;
  }

  getExpiringAbbonamentiCount(): number {
    if (!this.user?.abbonamenti) return 0;
    return this.user.abbonamenti.filter(
      (a) => this.getAbbonamentoStatus(a) === 'expiring'
    ).length;
  }

  getExpiredAbbonamentiCount(): number {
    if (!this.user?.abbonamenti) return 0;
    return this.user.abbonamenti.filter(
      (a) => this.getAbbonamentoStatus(a) === 'expired'
    ).length;
  }
  /**
   * Verifica se il certificato medico è scaduto
   */
  isExpired(): boolean {
    if (!this.user?.certificato_scadenza) return false;
    
    const today = new Date();
    const scadenza = new Date(this.user.certificato_scadenza);
    return scadenza < today;
  }

  /**
   * Scarica il certificato medico dell'utente
   */
  downloadCertificato(): void {
    if (!this.user?.certificato_medico || !this.user?.id) {
      this.notificationService.showError('Nessun certificato disponibile per il download');
      return;
    }

    this.fileUploadService.downloadCertificatoMedico(this.user.id, this.user.certificato_medico).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificato_${this.user?.nome}_${this.user?.cognome}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error: any) => {
        console.error('Errore nel download del certificato:', error);
        this.notificationService.showError('Errore nel download del certificato');
      }
    });
  }
}
