import { Component, OnInit, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";
import { LoadingSpinner } from "../../shared/loading-spinner/loading-spinner.component";

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
  imports: [CommonModule, FormsModule, HeaderComponent, LoadingSpinner],
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
  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;

    setTimeout(() => {
      this.loadUsers();
      this.loadSubscriptions();
      this.loadAccesses();
      this.updateCounters();
      this.isLoading = false;
    }, 1000);
  }

  private loadUsers() {
    this.users = [
      {
        id: 1,
        name: 'Mario Rossi',
        email: 'mario.rossi@email.com',
        phone: '+39 123 456 7890',
        registrationDate: '2024-01-15',
        lastAccess: '2025-06-15',
        isActive: true,
        subscription: { id: 1, type: 'monthly', startDate: '2025-06-01', endDate: '2025-06-30', price: 49.99, isActive: true }
      },
      {
        id: 2,
        name: 'Anna Verdi',
        email: 'anna.verdi@email.com',
        phone: '+39 987 654 3210',
        registrationDate: '2024-03-20',
        lastAccess: '2025-06-14',
        isActive: true,
        subscription: { id: 2, type: 'quarterly', startDate: '2025-04-01', endDate: '2025-06-30', price: 139.99, isActive: true }
      },
      {
        id: 3,
        name: 'Luca Bianchi',
        email: 'luca.bianchi@email.com',
        phone: '+39 555 777 9999',
        registrationDate: '2024-05-10',
        lastAccess: '2025-06-10',
        isActive: false
      }
    ];
  }

  private loadSubscriptions() {
    this.subscriptions = [
      { id: 1, type: 'monthly', startDate: '2025-06-01', endDate: '2025-06-30', price: 49.99, isActive: true },
      { id: 2, type: 'quarterly', startDate: '2025-04-01', endDate: '2025-06-30', price: 139.99, isActive: true },
      { id: 3, type: 'yearly', startDate: '2025-01-01', endDate: '2025-12-31', price: 499.99, isActive: true }
    ];
  }

  private loadAccesses() {
    this.accesses = [
      { id: 1, userId: 1, userName: 'Mario Rossi', timestamp: '2025-06-16 08:30', type: 'entry' },
      { id: 2, userId: 2, userName: 'Anna Verdi', timestamp: '2025-06-16 09:15', type: 'entry' },
      { id: 3, userId: 1, userName: 'Mario Rossi', timestamp: '2025-06-16 10:45', type: 'exit' },
      { id: 4, userId: 3, userName: 'Luca Bianchi', timestamp: '2025-06-15 18:20', type: 'entry' },
      { id: 5, userId: 3, userName: 'Luca Bianchi', timestamp: '2025-06-15 19:30', type: 'exit' }
    ];
  }

  private updateCounters() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.isActive).length;
    this.totalSubscriptions = this.subscriptions.filter(s => s.isActive).length;
    this.todayAccesses = this.accesses.filter(a => a.timestamp.includes('2025-06-16')).length;
    this.monthlyRevenue = this.subscriptions.filter(s => s.isActive).reduce((sum, s) => sum + s.price, 0);
  }

  // Metodi per cambiare vista
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
    if (this.selectedUser) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (index > -1) {
        this.users[index] = { ...this.users[index], ...this.userForm };
      }
    } else {
      // Add new user
      const newUser: User = {
        ...this.userForm,
        id: Math.max(...this.users.map(u => u.id)) + 1,
        registrationDate: new Date().toISOString().split('T')[0],
        isActive: true
      };
      this.users.push(newUser);
    }
    this.updateCounters();
    this.closeUserModal();
  }

  deleteUser(userId: number) {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      this.users = this.users.filter(u => u.id !== userId);
      this.updateCounters();
    }
  }

  assignSubscription(userId: number, subscriptionType: 'monthly' | 'quarterly' | 'yearly') {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const prices = { monthly: 49.99, quarterly: 139.99, yearly: 499.99 };
    const durations = { monthly: 1, quarterly: 3, yearly: 12 };

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durations[subscriptionType]);

    const newSubscription: Subscription = {
      id: Math.max(...this.subscriptions.map(s => s.id)) + 1,
      type: subscriptionType,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      price: prices[subscriptionType],
      isActive: true
    };

    this.subscriptions.push(newSubscription);
    user.subscription = newSubscription;
    this.updateCounters();
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
    const user = this.users.find(u => u.id === this.accessForm.userId);
    if (!user) {
      alert('Utente non trovato');
      return;
    }

    const newAccess: Access = {
      id: Math.max(...this.accesses.map(a => a.id)) + 1,
      userId: this.accessForm.userId,
      userName: user.name,
      timestamp: new Date().toLocaleString('it-IT'),
      type: this.accessForm.type
    };

    this.accesses.unshift(newAccess);
    user.lastAccess = new Date().toISOString().split('T')[0];
    this.updateCounters();
    this.closeAccessModal();
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
