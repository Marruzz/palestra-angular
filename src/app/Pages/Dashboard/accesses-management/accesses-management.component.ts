import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingresso, PalestraUser } from '../../../shared/services/dashboard.service';

// Interfacce
interface Access {
  id: number;
  userId: number;
  userName: string;
  timestamp: string;
  type: 'entry' | 'exit';
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface AccessForm {
  userId: number;
  type: 'entry' | 'exit';
}

@Component({
  selector: 'app-accesses-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './accesses-management.component.html',
  styleUrl: './accesses-management.component.css'
})
export class AccessesManagementComponent {
  @Input() accesses: Ingresso[] = [];
  @Input() users: PalestraUser[] = [];
  @Input() showAccessModal: boolean = false;
  @Input() accessForm: { id_utente: number } = {
    id_utente: 0
  };
  @Input() stats: any = null; // Aggiungiamo le statistiche dal dashboard
  @Output() accessModalOpen = new EventEmitter<void>();
  @Output() accessModalClose = new EventEmitter<void>();
  @Output() accessRegister = new EventEmitter<void>();
  @Output() accessFormChange = new EventEmitter<{ id_utente: number }>();
  onOpenAccessModal() {
    this.accessModalOpen.emit();
  }

  onCloseAccessModal() {
    this.accessModalClose.emit();
  }

  onRegisterAccess() {
    this.accessRegister.emit();
  }
  onAccessFormChange() {
    this.accessFormChange.emit(this.accessForm);
  }
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);

      // Verifica se la data è valida
      if (isNaN(date.getTime())) {
        return 'Data non valida';
      }

      // Formatta con il fuso orario italiano
      return date.toLocaleString('it-IT', {
        timeZone: 'Europe/Rome',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Errore nel formato data:', error);
      return 'Data non valida';
    }
  }

  getTypeLabel(type: string): string {
    return type === 'entry' ? 'Entrata' : 'Uscita';
  }

  getTypeColor(type: string): string {
    return type === 'entry' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getTypeIcon(type: string): string {
    return type === 'entry' ? 'M11 16l-4-4m0 0l4-4m-4 4h14' : 'M13 8l4 4m0 0l-4 4m4-4H3';
  }
  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Metodi helper per informazioni specifiche utente (manteniamo questi per la visualizzazione dettagliata)
  getUserAccessesTodayCount(userId: number): number {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.accesses.filter(access => {
      const accessDate = new Date(access.data_ora);
      return access.id_utente === userId && accessDate >= todayStart && accessDate <= todayEnd;
    }).length;
  }

  getLastAccessForUser(userId: number): string {
    const userAccesses = this.accesses
      .filter(access => access.id_utente === userId)
      .sort((a, b) => new Date(b.data_ora).getTime() - new Date(a.data_ora).getTime());

    if (userAccesses.length > 0) {
      return this.formatDateTime(userAccesses[0].data_ora);
    }
    return 'Nessun accesso registrato';
  }
}
