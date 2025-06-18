import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PalestraUser,
  Corso,
  Abbonamento,
  DashboardService,
} from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.css',
})
export class UserModalComponent implements OnInit {
  @Input() user: PalestraUser | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  showUserModal: boolean = true;
  userForm: any = {
    id: 0,
    nome: '',
    cognome: '',
    email: '',
    data_nascita: '',
    codice_fiscale: '',
  };
  selectedUser: PalestraUser | null = null;
  availableCorsi: Corso[] = [];
  userAbbonamenti: Abbonamento[] = [];
  newAbbonamento = {
    id_corso: 0,
    data_inizio: '',
    durata_mesi: 1,
    data_fine: '',
  };
  showAddAbbonamento = false;

  constructor(private dashboardService: DashboardService) {}

  formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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

  ngOnInit() {
    this.selectedUser = this.user;
    if (this.user) {



      this.userForm = {
        id: this.user.id,
        nome: this.user.nome,
        cognome: this.user.cognome,
        email: this.user.email || '',
        data_nascita: this.formatDateForBackend(this.user.data_nascita),
        codice_fiscale: this.user.codice_fiscale,
      };
      this.userAbbonamenti = [...this.user.abbonamenti];
    }
    this.loadCorsi();
  }

  loadCorsi() {
    this.dashboardService.getCorsi().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableCorsi = response.data;
        }
      },
      error: (error) => {
        
      },
    });
  }

  isAbbonamentoActive(abbonamento: Abbonamento): boolean {
    const today = new Date();
    const dataFine = new Date(abbonamento.data_fine);
    return dataFine >= today;
  }

  getCorsoName(idCorso: number): string {
    const corso = this.availableCorsi.find((c) => c.id === idCorso);
    return corso ? corso.nome_corso : 'Corso non trovato';
  }

  onCorsoChange() {
    if (this.newAbbonamento.id_corso > 0) {
      const selectedCorso = this.availableCorsi.find(
        (c) => c.id == this.newAbbonamento.id_corso
      );
      if (selectedCorso && selectedCorso.durata_mesi_default) {
        this.newAbbonamento.durata_mesi = selectedCorso.durata_mesi_default;
        this.calculateDataFine();
      }
    } else {
      this.newAbbonamento.durata_mesi = 1;
      this.newAbbonamento.data_fine = '';
    }
  }

  onDataInizioChange() {
    this.calculateDataFine();
  }

  calculateDataFine() {
    if (
      this.newAbbonamento.data_inizio &&
      this.newAbbonamento.durata_mesi > 0
    ) {
      const dataInizio = new Date(this.newAbbonamento.data_inizio);
      const dataFine = new Date(dataInizio);
      dataFine.setMonth(dataFine.getMonth() + this.newAbbonamento.durata_mesi);
      this.newAbbonamento.data_fine = dataFine.toISOString().split('T')[0];
    } else {
      this.newAbbonamento.data_fine = '';
    }
  }
  addAbbonamento() {
    if (
      this.newAbbonamento.id_corso &&
      this.newAbbonamento.data_inizio &&
      this.newAbbonamento.data_fine
    ) {
      const nuovoAbbonamento: Abbonamento = {
        id: 0,
        id_utente: this.userForm.id,
        id_corso: this.newAbbonamento.id_corso,
        data_inizio: this.newAbbonamento.data_inizio,
        durata_mesi: this.newAbbonamento.durata_mesi,
        data_fine: this.newAbbonamento.data_fine,
        nome_corso: this.getCorsoName(this.newAbbonamento.id_corso),
      };

      this.userAbbonamenti.push(nuovoAbbonamento);
      this.resetNewAbbonamento();
      this.showAddAbbonamento = false;
    }
  }

  removeAbbonamento(index: number) {
    this.userAbbonamenti.splice(index, 1);
  }
  resetNewAbbonamento() {
    this.newAbbonamento = {
      id_corso: 0,
      data_inizio: '',
      durata_mesi: 1,
      data_fine: '',
    };
  }

  onCloseUserModal() {
    this.close.emit();
  }
  onSaveUser() {
    const userData = {
      ...this.userForm,
      data_nascita: this.formatDateForBackend(this.userForm.data_nascita),
      abbonamenti: this.userAbbonamenti.map((abbonamento) => ({
        ...abbonamento,
        data_inizio: this.formatDateForBackend(abbonamento.data_inizio),
        data_fine: this.formatDateForBackend(abbonamento.data_fine),
      })),
    };
    this.save.emit(userData);
  }
}
