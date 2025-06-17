import { Component, OnInit, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { LoadingSpinner } from "../../shared/loading-spinner/loading-spinner.component";
import { StatsCards } from "./stats-cards/stats-cards.component";
import { PanoramicaUtentiSelection } from "./panoramica-utenti-selection/panoramica-utenti-selection.component";
import { NavigationTabs } from "./navigation-tabs/navigation-tabs.component";
import { UsersManagementComponent } from "./users-management/users-management.component";
import { SubscriptionsManagementComponent } from "./subscriptions-management/subscriptions-management.component";
import { AccessesManagementComponent } from "./accesses-management/accesses-management.component";
import {
  DashboardService,
  PalestraUser,
  Abbonamento,
  Ingresso,
  Corso,
  DashboardStats
} from '../../shared/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    LoadingSpinner,
    StatsCards,
    PanoramicaUtentiSelection,
    NavigationTabs,
    UsersManagementComponent,
    SubscriptionsManagementComponent,
    AccessesManagementComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @Output() logout = new EventEmitter<void>();
  private router = inject(Router);

  // Dati dal database
  users: PalestraUser[] = [];
  abbonamenti: Abbonamento[] = [];
  ingressi: Ingresso[] = [];
  corsi: Corso[] = [];
  stats: DashboardStats | null = null;

  // Stato dell'applicazione
  currentView: 'users' | 'subscriptions' | 'accesses' | 'stats' | 'corsi' = 'users';
  isLoading = false;
  showUserModal = false;
  showAccessModal = false;
  showSubscriptionModal = false;
  showCorsoModal = false;
  selectedUser: PalestraUser | null = null;
  selectedAbbonamento: Abbonamento | null = null;
  errorMessage = '';

  // Form data per utenti
  userForm = {
    id: 0,
    nome: '',
    cognome: '',
    email: '',
    data_nascita: '',
    codice_fiscale: ''
  };

  // Form data per abbonamenti
  subscriptionForm = {
    id: 0,
    id_utente: 0,
    id_corso: 0,
    data_inizio: '',
    durata_mesi: 1
  };

  // Form data per accessi
  accessForm = {
    id_utente: 0
  };

  // Form data per corsi
  corsoForm = {
    id: 0,
    nome_corso: '',
    descrizione: '',
    durata_mesi_default: 1
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';

    // Carica tutti i dati in parallelo
    Promise.all([
      this.loadUsers(),
      this.loadSubscriptions(),
      this.loadAccesses(),
      this.loadStats(),
      this.loadCorsi()
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Errore nel caricamento dei dati:', error);
      this.errorMessage = 'Errore nel caricamento dei dati. Riprova più tardi.';
      this.isLoading = false;
    });
  }

  private loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.getUsers().subscribe({
        next: (response) => {
          if (response.success) {
            this.users = response.data;
            resolve();
          } else {
            reject(new Error(response.message || 'Errore nel caricamento utenti'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private loadSubscriptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.getSubscriptions().subscribe({
        next: (response) => {
          if (response.success) {
            this.abbonamenti = response.data;
            resolve();
          } else {
            reject(new Error(response.message || 'Errore nel caricamento abbonamenti'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private loadAccesses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.getAccesses().subscribe({
        next: (response) => {
          if (response.success) {
            this.ingressi = response.data;
            resolve();
          } else {
            reject(new Error(response.message || 'Errore nel caricamento accessi'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private loadStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.getDashboardStats().subscribe({
        next: (response) => {
          if (response.success) {
            this.stats = response.data;
            resolve();
          } else {
            reject(new Error(response.message || 'Errore nel caricamento statistiche'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  private loadCorsi(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.getCorsi().subscribe({
        next: (response) => {
          if (response.success) {
            this.corsi = response.data;
            resolve();
          } else {
            reject(new Error(response.message || 'Errore nel caricamento corsi'));
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  // Gestione delle viste
  setView(view: 'users' | 'subscriptions' | 'accesses' | 'stats' | 'corsi') {
    this.currentView = view;
  }

  // Gestione utenti
  openUserModal(user?: PalestraUser) {
    this.selectedUser = user || null;
    if (user) {
      this.userForm = {
        id: user.id,
        nome: user.nome,
        cognome: user.cognome,
        email: user.email || '',
        data_nascita: user.data_nascita,
        codice_fiscale: user.codice_fiscale
      };
    } else {
      this.resetUserForm();
    }
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.selectedUser = null;
    this.resetUserForm();
  }

  private resetUserForm() {
    this.userForm = {
      id: 0,
      nome: '',
      cognome: '',
      email: '',
      data_nascita: '',
      codice_fiscale: ''
    };
  }

  saveUser() {
    if (this.selectedUser) {
      // Aggiorna utente esistente
      this.dashboardService.updateUser(this.selectedUser.id, this.userForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
            this.closeUserModal();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = 'Errore nell\'aggiornamento utente';
        }
      });
    } else {
      // Crea nuovo utente
      this.dashboardService.createUser(this.userForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
            this.closeUserModal();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = 'Errore nella creazione utente';
        }
      });
    }
  }

  deleteUser(user: PalestraUser) {
    if (confirm(`Sei sicuro di voler eliminare l'utente ${user.nome} ${user.cognome}?`)) {
      this.dashboardService.deleteUser(user.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadUsers();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = 'Errore nell\'eliminazione utente';
        }
      });
    }
  }

  // Gestione abbonamenti
  openSubscriptionModal(abbonamento?: Abbonamento) {
    this.selectedAbbonamento = abbonamento || null;
    if (abbonamento) {
      this.subscriptionForm = {
        id: abbonamento.id,
        id_utente: abbonamento.id_utente,
        id_corso: abbonamento.id_corso,
        data_inizio: abbonamento.data_inizio,
        durata_mesi: abbonamento.durata_mesi
      };
    } else {
      this.resetSubscriptionForm();
    }
    this.showSubscriptionModal = true;
  }

  closeSubscriptionModal() {
    this.showSubscriptionModal = false;
    this.selectedAbbonamento = null;
    this.resetSubscriptionForm();
  }

  private resetSubscriptionForm() {
    this.subscriptionForm = {
      id: 0,
      id_utente: 0,
      id_corso: 0,
      data_inizio: '',
      durata_mesi: 1
    };
  }

  saveSubscription() {
    if (this.selectedAbbonamento) {
      // Aggiorna abbonamento esistente
      this.dashboardService.updateSubscription(this.selectedAbbonamento.id, this.subscriptionForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubscriptions();
            this.closeSubscriptionModal();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = 'Errore nell\'aggiornamento abbonamento';
        }
      });
    } else {
      // Crea nuovo abbonamento
      this.dashboardService.createSubscription(this.subscriptionForm).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubscriptions();
            this.closeSubscriptionModal();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = 'Errore nella creazione abbonamento';
        }
      });
    }
  }

  deleteSubscription(abbonamento: Abbonamento) {
    if (confirm(`Sei sicuro di voler eliminare questo abbonamento?`)) {
      this.dashboardService.deleteSubscription(abbonamento.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubscriptions();
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.errorMessage = 'Errore nell\'eliminazione abbonamento';
        }
      });
    }
  }

  // Gestione accessi
  openAccessModal() {
    this.resetAccessForm();
    this.showAccessModal = true;
  }

  closeAccessModal() {
    this.showAccessModal = false;
    this.resetAccessForm();
  }

  private resetAccessForm() {
    this.accessForm = {
      id_utente: 0
    };
  }

  saveAccess() {
    this.dashboardService.createAccess(this.accessForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAccesses();
          this.loadStats(); // Aggiorna le statistiche
          this.closeAccessModal();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.errorMessage = 'Errore nella registrazione accesso';
      }
    });
  }

  // Gestione corsi
  openCorsoModal(corso?: Corso) {
    if (corso) {
      this.corsoForm = {
        id: corso.id,
        nome_corso: corso.nome_corso,
        descrizione: corso.descrizione || '',
        durata_mesi_default: corso.durata_mesi_default || 1
      };
    } else {
      this.resetCorsoForm();
    }
    this.showCorsoModal = true;
  }

  closeCorsoModal() {
    this.showCorsoModal = false;
    this.resetCorsoForm();
  }

  private resetCorsoForm() {
    this.corsoForm = {
      id: 0,
      nome_corso: '',
      descrizione: '',
      durata_mesi_default: 1
    };
  }

  saveCorso() {
    this.dashboardService.createCorso(this.corsoForm).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadCorsi();
          this.closeCorsoModal();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.errorMessage = 'Errore nella creazione corso';
      }
    });
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT');
  }

  getUserById(id: number): PalestraUser | undefined {
    return this.users.find(user => user.id === id);
  }

  getCorsoById(id: number): Corso | undefined {
    return this.corsi.find(corso => corso.id === id);
  }

  // Logout (se necessario)
  onLogout() {
    this.logout.emit();
    this.router.navigate(['/login']);
  }
}
