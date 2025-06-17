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

  // Stato del caricamento per ogni sezione
  private loadedSections = {
    users: false,
    subscriptions: false,
    accesses: false,
    stats: false,
    corsi: false
  };

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
    id_utente: 0,
    data_ora: new Date().toISOString().slice(0, 16) // Formato datetime-local
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
    // Carica solo le statistiche all'avvio per il riepilogo iniziale
    this.loadStatsIfNeeded();
  }

  private async loadDashboardData() {
    // Metodo deprecato - ora i dati vengono caricati on-demand
  }

  // Caricamento lazy dei dati per sezione
  private async loadUsersIfNeeded(): Promise<void> {
    if (this.loadedSections.users) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.loadUsers();
      this.loadedSections.users = true;
    } catch (error) {
      console.error('Errore nel caricamento utenti:', error);
      this.errorMessage = 'Errore nel caricamento utenti. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadSubscriptionsIfNeeded(): Promise<void> {
    if (this.loadedSections.subscriptions) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.loadSubscriptions();
      this.loadedSections.subscriptions = true;
    } catch (error) {
      console.error('Errore nel caricamento abbonamenti:', error);
      this.errorMessage = 'Errore nel caricamento abbonamenti. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadAccessesIfNeeded(): Promise<void> {
    if (this.loadedSections.accesses) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.loadAccesses();
      this.loadedSections.accesses = true;
    } catch (error) {
      console.error('Errore nel caricamento accessi:', error);
      this.errorMessage = 'Errore nel caricamento accessi. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadStatsIfNeeded(): Promise<void> {
    if (this.loadedSections.stats) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.loadStats();
      this.loadedSections.stats = true;
    } catch (error) {
      console.error('Errore nel caricamento statistiche:', error);
      this.errorMessage = 'Errore nel caricamento statistiche. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadCorsiIfNeeded(): Promise<void> {
    if (this.loadedSections.corsi) return;

    try {
      this.isLoading = true;
      this.errorMessage = '';
      await this.loadCorsi();
      this.loadedSections.corsi = true;
    } catch (error) {
      console.error('Errore nel caricamento corsi:', error);
      this.errorMessage = 'Errore nel caricamento corsi. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }
  private async loadUsers(): Promise<void> {
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

  private async loadSubscriptions(): Promise<void> {
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

  private async loadAccesses(): Promise<void> {
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

  private async loadStats(): Promise<void> {
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

  private async loadCorsi(): Promise<void> {
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
  async setView(view: 'users' | 'subscriptions' | 'accesses' | 'stats' | 'corsi') {
    this.currentView = view;

    // Carica i dati specifici per la vista selezionata
    switch (view) {
      case 'users':
        await this.loadUsersIfNeeded();
        break;
      case 'subscriptions':
        // Carica utenti e corsi se necessario per i dropdown
        await Promise.all([
          this.loadSubscriptionsIfNeeded(),
          this.loadUsersIfNeeded(),
          this.loadCorsiIfNeeded()
        ]);
        break;
      case 'accesses':
        // Carica utenti se necessario per i dropdown
        await Promise.all([
          this.loadAccessesIfNeeded(),
          this.loadUsersIfNeeded()
        ]);
        break;
      case 'stats':
        await this.loadStatsIfNeeded();
        break;
      case 'corsi':
        await this.loadCorsiIfNeeded();
        break;
    }
  }
  // Gestione utenti
  async openUserModal(user?: PalestraUser) {
    // Assicurati che i corsi siano caricati per il dropdown
    await this.loadCorsiIfNeeded();

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
  }  async saveUser(userFormData?: any) {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Se abbiamo dati dal form, aggiorna userForm
      if (userFormData) {
        this.userForm = { ...userFormData };
      }

      if (this.selectedUser) {
        // Aggiorna utente esistente
        await new Promise<void>((resolve, reject) => {
          this.dashboardService.updateUser(this.selectedUser!.id, this.userForm).subscribe({
            next: (response) => {
              if (response.success) {
                // Se ci sono abbonamenti da aggiornare
                if (userFormData && userFormData.abbonamenti) {
                  this.updateUserAbbonamenti(this.selectedUser!.id, userFormData.abbonamenti).then(() => {
                    resolve();
                  }).catch(reject);
                } else {
                  resolve();
                }
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });      } else {
        // Crea nuovo utente
        let newUserId: number;
        await new Promise<void>((resolve, reject) => {
          this.dashboardService.createUser(this.userForm).subscribe({
            next: (response) => {
              if (response.success && response.data) {
                newUserId = response.data.id;
                // Se ci sono abbonamenti da creare per il nuovo utente
                if (userFormData && userFormData.abbonamenti && userFormData.abbonamenti.length > 0) {
                  this.updateUserAbbonamenti(newUserId, userFormData.abbonamenti).then(() => {
                    resolve();
                  }).catch(reject);
                } else {
                  resolve();
                }
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });
      }

      // Ricarica i dati utenti
      this.loadedSections.users = false;
      await this.loadUsersIfNeeded();
      this.closeUserModal();

    } catch (error: any) {
      this.errorMessage = error.message || 'Errore nell\'operazione utente';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteUser(user: PalestraUser) {
    if (confirm(`Sei sicuro di voler eliminare l'utente ${user.nome} ${user.cognome}?`)) {
      try {
        this.isLoading = true;
        this.errorMessage = '';

        await new Promise<void>((resolve, reject) => {
          this.dashboardService.deleteUser(user.id).subscribe({
            next: (response) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });

        // Ricarica i dati utenti
        this.loadedSections.users = false;
        await this.loadUsersIfNeeded();

      } catch (error: any) {
        this.errorMessage = error.message || 'Errore nell\'eliminazione utente';
      } finally {
        this.isLoading = false;
      }
    }
  }
  // Gestione abbonamenti
  async openSubscriptionModal(abbonamento?: Abbonamento) {
    // Assicurati che utenti e corsi siano caricati per i dropdown
    await Promise.all([
      this.loadUsersIfNeeded(),
      this.loadCorsiIfNeeded()
    ]);

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
  async saveSubscription() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      if (this.selectedAbbonamento) {
        // Aggiorna abbonamento esistente
        await new Promise<void>((resolve, reject) => {
          this.dashboardService.updateSubscription(this.selectedAbbonamento!.id, this.subscriptionForm).subscribe({
            next: (response) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });
      } else {
        // Crea nuovo abbonamento
        await new Promise<void>((resolve, reject) => {
          this.dashboardService.createSubscription(this.subscriptionForm).subscribe({
            next: (response) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });
      }

      // Ricarica i dati abbonamenti
      this.loadedSections.subscriptions = false;
      await this.loadSubscriptionsIfNeeded();
      this.closeSubscriptionModal();

    } catch (error: any) {
      this.errorMessage = error.message || 'Errore nell\'operazione abbonamento';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteSubscription(abbonamento: Abbonamento) {
    if (confirm(`Sei sicuro di voler eliminare questo abbonamento?`)) {
      try {
        this.isLoading = true;
        this.errorMessage = '';

        await new Promise<void>((resolve, reject) => {
          this.dashboardService.deleteSubscription(abbonamento.id).subscribe({
            next: (response) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });

        // Ricarica i dati abbonamenti
        this.loadedSections.subscriptions = false;
        await this.loadSubscriptionsIfNeeded();

      } catch (error: any) {
        this.errorMessage = error.message || 'Errore nell\'eliminazione abbonamento';
      } finally {
        this.isLoading = false;
      }
    }
  }
  // Gestione accessi
  async openAccessModal() {
    // Assicurati che gli utenti siano caricati per il dropdown
    await this.loadUsersIfNeeded();

    this.resetAccessForm();
    this.showAccessModal = true;
  }

  closeAccessModal() {
    this.showAccessModal = false;
    this.resetAccessForm();
  }

  private resetAccessForm() {
    this.accessForm = {
      id_utente: 0,
      data_ora: new Date().toISOString().slice(0, 16) // Formato datetime-local
    };
  }
  async saveAccess() {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      await new Promise<void>((resolve, reject) => {
        this.dashboardService.createAccess(this.accessForm).subscribe({
          next: (response) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.message));
            }
          },
          error: reject
        });
      });

      // Ricarica accessi e statistiche
      this.loadedSections.accesses = false;
      this.loadedSections.stats = false;
      await Promise.all([
        this.loadAccessesIfNeeded(),
        this.loadStatsIfNeeded()
      ]);
      this.closeAccessModal();

    } catch (error: any) {
      this.errorMessage = error.message || 'Errore nella registrazione accesso';
    } finally {
      this.isLoading = false;
    }
  }
  // Gestione corsi
  openCorsoModal(corso?: Corso) {
    this.errorMessage = ''; // Pulisce eventuali errori precedenti
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
    this.errorMessage = '';
    this.resetCorsoForm();
  }

  private resetCorsoForm() {
    this.corsoForm = {
      id: 0,
      nome_corso: '',
      descrizione: '',
      durata_mesi_default: 1
    };
  }  async saveCorso() {
    // Validazione client-side
    if (!this.corsoForm.nome_corso || this.corsoForm.nome_corso.trim() === '') {
      this.errorMessage = 'Il nome del corso è obbligatorio';
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';

      await new Promise<void>((resolve, reject) => {
        this.dashboardService.createCorso(this.corsoForm).subscribe({
          next: (response) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.message || 'Errore sconosciuto'));
            }
          },
          error: reject
        });
      });

      // Ricarica i corsi
      this.loadedSections.corsi = false;
      await this.loadCorsiIfNeeded();
      this.closeCorsoModal();

    } catch (error: any) {
      this.errorMessage = error.message || 'Errore nella comunicazione con il server';
    } finally {
      this.isLoading = false;
    }
  }

  // Metodi di utility per il refresh forzato dei dati
  async refreshCurrentView(): Promise<void> {
    // Reset del flag di caricamento per la vista corrente
    this.loadedSections[this.currentView] = false;

    // Ricarica i dati per la vista corrente
    await this.setView(this.currentView);
  }

  async refreshAllData(): Promise<void> {
    // Reset di tutti i flag di caricamento
    Object.keys(this.loadedSections).forEach(key => {
      this.loadedSections[key as keyof typeof this.loadedSections] = false;
    });

    // Ricarica solo le statistiche iniziali
    await this.loadStatsIfNeeded();
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }
  formatDateTime(dateString: string): string {
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

  async updateUserAbbonamenti(userId: number, abbonamenti: any[]): Promise<void> {
    // Prima elimina tutti gli abbonamenti esistenti dell'utente
    // (questo è un approccio semplificato - in produzione potresti voler fare un merge più sofisticato)

    // Poi crea i nuovi abbonamenti
    for (const abbonamento of abbonamenti) {
      if (abbonamento.id === 0) {
        // Nuovo abbonamento
        await new Promise<void>((resolve, reject) => {
          this.dashboardService.createSubscription({
            id_utente: userId,
            id_corso: abbonamento.id_corso,
            data_inizio: abbonamento.data_inizio,
            durata_mesi: abbonamento.durata_mesi,
            data_fine: abbonamento.data_fine
          }).subscribe({
            next: (response) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });
      } else {
        // Aggiorna abbonamento esistente
        await new Promise<void>((resolve, reject) => {
          this.dashboardService.updateSubscription(abbonamento.id, {
            id_corso: abbonamento.id_corso,
            data_inizio: abbonamento.data_inizio,
            durata_mesi: abbonamento.durata_mesi,
            data_fine: abbonamento.data_fine
          }).subscribe({
            next: (response) => {
              if (response.success) {
                resolve();
              } else {
                reject(new Error(response.message));
              }
            },
            error: reject
          });
        });
      }
    }
  }
}
