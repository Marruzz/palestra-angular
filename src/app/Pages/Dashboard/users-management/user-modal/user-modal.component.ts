import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PalestraUser, Corso, Abbonamento, DashboardService } from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.css'
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
    codice_fiscale: ''
  };
  selectedUser: PalestraUser | null = null;
  availableCorsi: Corso[] = [];
  userAbbonamenti: Abbonamento[] = [];
  newAbbonamento = {
    id_corso: 0,
    data_inizio: '',
    durata_mesi: 1
  };
  showAddAbbonamento = false;

  constructor(private dashboardService: DashboardService) {}
  ngOnInit() {
    this.selectedUser = this.user;
    if (this.user) {
      this.userForm = {
        id: this.user.id,
        nome: this.user.nome,
        cognome: this.user.cognome,
        email: this.user.email || '',
        data_nascita: this.user.data_nascita,
        codice_fiscale: this.user.codice_fiscale
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
        console.error('Errore nel caricamento corsi:', error);
      }
    });
  }

  isAbbonamentoActive(abbonamento: Abbonamento): boolean {
    const today = new Date();
    const dataFine = new Date(abbonamento.data_fine);
    return dataFine >= today;
  }

  getCorsoName(idCorso: number): string {
    const corso = this.availableCorsi.find(c => c.id === idCorso);
    return corso ? corso.nome_corso : 'Corso non trovato';
  }

  addAbbonamento() {
    if (this.newAbbonamento.id_corso && this.newAbbonamento.data_inizio) {
      const dataInizio = new Date(this.newAbbonamento.data_inizio);
      const dataFine = new Date(dataInizio);
      dataFine.setMonth(dataFine.getMonth() + this.newAbbonamento.durata_mesi);

      const nuovoAbbonamento: Abbonamento = {
        id: 0, // Sarà assegnato dal backend
        id_utente: this.userForm.id,
        id_corso: this.newAbbonamento.id_corso,
        data_inizio: this.newAbbonamento.data_inizio,
        durata_mesi: this.newAbbonamento.durata_mesi,
        data_fine: dataFine.toISOString().split('T')[0],
        nome_corso: this.getCorsoName(this.newAbbonamento.id_corso)
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
      durata_mesi: 1
    };
  }

  onCloseUserModal() {
    this.close.emit();
  }
  onSaveUser() {
    const userData = {
      ...this.userForm,
      abbonamenti: this.userAbbonamenti
    };
    this.save.emit(userData);
  }
}
