import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  PalestraUser,
  Corso,
  Abbonamento,
  DashboardService,
} from '../../../../shared/services/dashboard.service';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { NotificationService } from '../../../../shared/services/notification.service';

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
    certificato_scadenza: '',
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

  // Nuovo campo per gestire il file del certificato
  selectedCertificato: File | null = null;
  certificatoFileName: string = '';
  uploadProgress: number = 0;
  isUploading: boolean = false;

  constructor(
    private dashboardService: DashboardService,
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService
  ) {}
  formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  formatDateForUI(dateString: string): string {
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
    } else {
      // Reset per nuovo utente
      this.resetCertificateForm();
    }
    this.loadCorsi();

    // Se l'utente ha un certificato medico, impostare la data di scadenza
    if (this.selectedUser?.certificato_scadenza) {
      this.userForm.certificato_scadenza = this.formatDateForUI(
        this.selectedUser.certificato_scadenza
      );
    }
  }

  /**
   * Reset dei campi del certificato per nuovo utente
   */
  resetCertificateForm() {
    this.selectedCertificato = null;
    this.certificatoFileName = '';
    this.isUploading = false;
  }

  loadCorsi() {
    this.dashboardService.getCorsi().subscribe({
      next: (response) => {
        if (response.success) {
          this.availableCorsi = response.data;
        }
      },
      error: (error) => {},
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
  getAge(dataNascita: string): number {
    if (!dataNascita) return 0;

    const birthDate = new Date(dataNascita);
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
    
    // Per i nuovi utenti, aggiungiamo il certificato se presente
    if (!this.selectedUser && this.selectedCertificato && this.userForm.certificato_scadenza) {
      userData.certificato = this.selectedCertificato;
      userData.certificato_scadenza = this.formatDateForBackend(this.userForm.certificato_scadenza);
    }
    
    this.save.emit(userData);
  }

  onCertificatoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCertificato = input.files[0];
      this.certificatoFileName = this.selectedCertificato.name;
    }
  }

  async uploadCertificato(): Promise<void> {
    if (
      !this.selectedCertificato ||
      !this.selectedUser ||
      !this.userForm.certificato_scadenza
    ) {
      this.notificationService.showError(
        'Seleziona un certificato e imposta la data di scadenza'
      );
      return;
    }

    this.isUploading = true;

    try {
      await this.fileUploadService
        .uploadCertificatoMedico(
          this.selectedUser.id,
          this.selectedCertificato,
          this.userForm.certificato_scadenza
        )        .subscribe(
          (response) => {
            this.notificationService.showSuccess(
              'Certificato medico caricato con successo'
            );
            this.isUploading = false;
            if (this.selectedUser) {
              this.selectedUser.certificato_medico = response.fileName;
              this.selectedUser.certificato_scadenza = response.scadenza;
            }
          },
          (error) => {
            this.notificationService.showError(
              'Errore nel caricamento del certificato'
            );
            this.isUploading = false;
          }
        );
    } catch (error) {
      this.isUploading = false;
      this.notificationService.showError(
        'Errore nel caricamento del certificato'
      );
    }
  }

  downloadCertificato(): void {
    if (!this.selectedUser?.certificato_medico) {
      return;
    }

    this.fileUploadService
      .downloadCertificatoMedico(
        this.selectedUser.id,
        this.selectedUser.certificato_medico
      )
      .subscribe(
        (response: Blob) => {
          // Crea un URL per il blob e avvia il download
          const url = window.URL.createObjectURL(response);
          const a = document.createElement('a');
          a.href = url;          a.download =
            this.selectedUser?.certificato_medico || 'certificato_medico.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          this.notificationService.showError('Errore nel download del certificato');
        }
      );
  }

  isExpired(dateString: string): boolean {
    if (!dateString) return false;
    
    const today = new Date();
    const expirationDate = new Date(dateString);
    
    // Resetta l'ora per confrontare solo le date
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    
    return expirationDate < today;
  }
}
