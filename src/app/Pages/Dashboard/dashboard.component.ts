import { StatsCards } from './stats-cards/stats-cards.component';
import { Component, OnInit, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { LoadingSpinner } from "../../shared/loading-spinner/loading-spinner.component";
import {
  DashboardService,
  PalestraUser,
  Subscription as PalestraSubscription,
  Access as PalestraAccess,
  DashboardStats
} from '../../shared/services/dashboard.service';
import { AuthService } from '../../shared/services/auth.service';
import { PanoramicaUtentiSelection } from "./panoramica-utenti-selection/panoramica-utenti-selection.component";
import { NavigationTabs } from "./navigation-tabs/navigation-tabs.component";
import { UsersManagementComponent } from "./users-management/users-management.component";
import { SubscriptionsManagementComponent } from "./subscriptions-management/subscriptions-management.component";
import { AccessesManagementComponent } from "./accesses-management/accesses-management.component";
import { StatsOverviewComponent } from "./stats-overview/stats-overview.component";

// Interfacce locali per compatibilità con il template esistente
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  subscription?: Subscription;
  registrationDate: string;
  lastAccess?: string;
  isActive: boolean;
}

interface Subscription {
  id: number;
  type: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  price: number;
  isActive: boolean;
}

interface Access {
  id: number;
  userId: number;
  userName: string;
  timestamp: string;
  type: 'entry' | 'exit';
}

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
    AccessesManagementComponent,
    StatsOverviewComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  @Output() logout = new EventEmitter<void>();
  private router = inject(Router);

  // Dati per le tabelle
  users: User[] = [];
  subscriptions: Subscription[] = [];
  accesses: Access[] = [];

  // Stato dell'applicazione
  currentView: 'users' | 'subscriptions' | 'accesses' | 'stats' = 'users';
  isLoading = false;
  showUserModal = false;
  showAccessModal = false;
  selectedUser: User | null = null;
  errorMessage = '';

  // Form data
  userForm = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    isActive: true
  };

  accessForm = {
    userId: 0,
    type: 'entry' as 'entry' | 'exit'
  };

  // Contatori dashboard
  totalUsers = 0;
  activeUsers = 0;
  totalSubscriptions = 0;
  todayAccesses = 0;
  monthlyRevenue = 0;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

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
      this.loadStats()
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
            // Converte i dati dal formato database al formato del template
            this.users = response.data.map(user => ({
              id: user.id,
              name: `${user.nome} ${user.cognome}`,
              email: user.email,
              phone: user.telefono || '',
              registrationDate: this.formatDate(user.data_iscrizione),
              lastAccess: user.ultimo_accesso ? this.formatDate(user.ultimo_accesso) : undefined,
              isActive: user.attivo,
              subscription: user.abbonamento ? {
                id: user.abbonamento.id,
                type: this.mapSubscriptionType(user.abbonamento.tipo),
                startDate: this.formatDate(user.abbonamento.data_inizio),
                endDate: this.formatDate(user.abbonamento.data_fine),
                price: user.abbonamento.prezzo,
                isActive: user.abbonamento.attivo
              } : undefined
            }));
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
            this.subscriptions = response.data.map(sub => ({
              id: sub.id,
              type: this.mapSubscriptionType(sub.tipo),
              startDate: this.formatDate(sub.data_inizio),
              endDate: this.formatDate(sub.data_fine),
              price: sub.prezzo,
              isActive: sub.attivo
            }));
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
            this.accesses = response.data.map(access => ({
              id: access.id,
              userId: access.user_id,
              userName: access.nome_utente,
              timestamp: this.formatDateTime(access.timestamp),
              type: access.tipo === 'entrata' ? 'entry' : 'exit'
            }));
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
            this.totalUsers = response.data.totale_utenti;
            this.activeUsers = response.data.utenti_attivi;
            this.totalSubscriptions = response.data.abbonamenti_attivi;
            this.todayAccesses = response.data.accessi_oggi;
            this.monthlyRevenue = response.data.ricavi_mensili;
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

  // Metodi di utilità per la conversione dei dati
  private mapSubscriptionType(tipo: string): 'monthly' | 'quarterly' | 'yearly' {
    switch (tipo) {
      case 'mensile': return 'monthly';
      case 'trimestrale': return 'quarterly';
      case 'annuale': return 'yearly';
      default: return 'monthly';
    }
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('it-IT');
  }
  private formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('it-IT');
  }

  // Metodi esistenti per gestire l'UI (mantenuti dal codice originale)

  // Metodi per cambiare vista
  onViewChange(view: 'users' | 'subscriptions' | 'accesses' | 'stats') {
    this.currentView = view;
  }

  showUsers() { this.currentView = 'users'; }
  showSubscriptions() { this.currentView = 'subscriptions'; }
  showAccesses() { this.currentView = 'accesses'; }
  showStats() { this.currentView = 'stats'; }

  // Getter per le viste per risolvere problemi di tipo
  get isUsersView() { return this.currentView === 'users'; }
  get isSubscriptionsView() { return this.currentView === 'subscriptions'; }
  get isAccessesView() { return this.currentView === 'accesses'; }
  get isStatsView() { return this.currentView === 'stats'; }

  // Gestione utenti
  openUserModal(user?: User) {
    if (user) {
      this.userForm = { ...user };
      this.selectedUser = user;
    } else {
      this.resetUserForm();
      this.selectedUser = null;
    }
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.resetUserForm();
    this.selectedUser = null;
  }
  saveUser() {
    if (!this.userForm.name || !this.userForm.email) {
      alert('Nome e email sono obbligatori');
      return;
    }

    // Estrai nome e cognome dal campo name
    const nameParts = this.userForm.name.trim().split(' ');
    const nome = nameParts[0] || '';
    const cognome = nameParts.slice(1).join(' ') || '';

    const userData = {
      nome,
      cognome,
      email: this.userForm.email,
      telefono: this.userForm.phone,
      attivo: this.userForm.isActive
    };

    this.isLoading = true;

    if (this.selectedUser) {
      // Update existing user
      this.dashboardService.updateUser(this.selectedUser.id, userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.loadDashboardData(); // Ricarica tutti i dati
            this.closeUserModal();
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Errore nell\'aggiornamento utente:', error);
          alert('Errore nell\'aggiornamento dell\'utente');
        }
      });
    } else {
      // Add new user
      this.dashboardService.createUser(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.loadDashboardData(); // Ricarica tutti i dati
            this.closeUserModal();
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Errore nella creazione utente:', error);
          alert('Errore nella creazione dell\'utente');
        }
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      this.isLoading = true;

      this.dashboardService.deleteUser(userId).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.loadDashboardData(); // Ricarica tutti i dati
          } else {
            alert(response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Errore nell\'eliminazione utente:', error);
          alert('Errore nell\'eliminazione dell\'utente');
        }
      });
    }
  }

  assignSubscription(userId: number, subscriptionType: 'monthly' | 'quarterly' | 'yearly') {
    const prices = { monthly: 50.00, quarterly: 140.00, yearly: 500.00 };
    const durations = { monthly: 1, quarterly: 3, yearly: 12 };
    const typeMapping = { monthly: 'mensile', quarterly: 'trimestrale', yearly: 'annuale' } as const;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durations[subscriptionType]);

    const subscriptionData = {
      user_id: userId,
      tipo: typeMapping[subscriptionType],
      data_inizio: startDate.toISOString().split('T')[0],
      data_fine: endDate.toISOString().split('T')[0],
      prezzo: prices[subscriptionType],
      attivo: true
    };

    this.isLoading = true;

    this.dashboardService.createSubscription(subscriptionData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.loadDashboardData(); // Ricarica tutti i dati
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Errore nella creazione abbonamento:', error);
        alert('Errore nella creazione dell\'abbonamento');
      }
    });
  }

  // Gestione accessi
  openAccessModal() {
    this.accessForm = { userId: 0, type: 'entry' };
    this.showAccessModal = true;
  }

  closeAccessModal() {
    this.showAccessModal = false;
  }
  registerAccess() {
    if (!this.accessForm.userId) {
      alert('Seleziona un utente');
      return;
    }

    const accessData = {
      user_id: this.accessForm.userId,
      tipo: this.accessForm.type === 'entry' ? 'entrata' : 'uscita'
    } as const;

    this.isLoading = true;

    this.dashboardService.createAccess(accessData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.loadDashboardData(); // Ricarica tutti i dati
          this.closeAccessModal();
        } else {
          alert(response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Errore nella registrazione accesso:', error);
        alert('Errore nella registrazione dell\'accesso');
      }
    });
  }

  // Helper methods for template
  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  getActiveSubscriptionsByType(type: 'monthly' | 'quarterly' | 'yearly'): number {
    return this.subscriptions.filter(s => s.type === type && s.isActive).length;
  }

  private resetUserForm() {
    this.userForm = {
      id: 0,
      name: '',
      email: '',
      phone: '',
      isActive: true
    };
  }

  onLogout() {
    this.logout.emit();
    this.router.navigate(['/login']);
  }
}
