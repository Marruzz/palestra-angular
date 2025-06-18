/**
 * ESEMPIO DI UTILIZZO DEL SERVIZIO DI STATO
 *
 * Questo file mostra come utilizzare il StateService per gestire lo stato
 * dell'applicazione in modo centralizzato.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { StateService } from '../../../shared/services/state.service';
import { DashboardService } from '../../../shared/services/dashboard.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { User, Subscription as UserSubscription } from '../../../shared/models';

@Component({
  selector: 'app-state-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="state-example">
      <h2>Esempio di Gestione dello Stato</h2>

      <!-- Utente selezionato -->
      <div *ngIf="selectedUser$ | async as selectedUser" class="selected-user">
        <h3>Utente Selezionato:</h3>
        <p>{{ selectedUser.nome }} {{ selectedUser.cognome }}</p>
        <button (click)="clearSelectedUser()">Deseleziona</button>
      </div>

      <!-- Lista utenti -->
      <div class="users-list">
        <h3>Lista Utenti ({{ (users$ | async)?.length || 0 }})</h3>
        <div *ngFor="let user of users$ | async"
             class="user-item"
             [class.selected]="(selectedUser$ | async)?.id === user.id"
             (click)="selectUser(user)">
          {{ user.nome }} {{ user.cognome }}
        </div>
      </div>

      <!-- Stato di caricamento -->
      <div *ngIf="loading$ | async" class="loading">
        Caricamento in corso...
      </div>

      <!-- Errori -->
      <div *ngIf="error$ | async as error" class="error">
        Errore: {{ error }}
        <button (click)="clearError()">Chiudi</button>
      </div>

      <!-- Azioni -->
      <div class="actions">
        <button (click)="loadUsers()" [disabled]="loading$ | async">
          Carica Utenti
        </button>
        <button (click)="showNotifications()">
          Test Notifiche
        </button>
      </div>
    </div>
  `,
  styles: [`
    .state-example {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .selected-user {
      background: #e3f2fd;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .users-list {
      margin-bottom: 20px;
    }

    .user-item {
      padding: 10px;
      border: 1px solid #ddd;
      margin-bottom: 5px;
      cursor: pointer;
      border-radius: 4px;
    }

    .user-item:hover {
      background: #f5f5f5;
    }

    .user-item.selected {
      background: #2196f3;
      color: white;
    }

    .loading {
      background: #fff3cd;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .error {
      background: #f8d7da;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .actions button {
      margin-right: 10px;
      padding: 10px 15px;
      border: none;
      background: #2196f3;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .actions button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .actions button:hover:not(:disabled) {
      background: #1976d2;
    }
  `]
})
export class StateExampleComponent implements OnInit, OnDestroy {
  // Osservabili dallo stato
  selectedUser$: Observable<User | null>;
  users$: Observable<User[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private subscriptions: Subscription[] = [];

  constructor(
    private stateService: StateService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {
    // Inizializza gli osservabili
    this.selectedUser$ = this.stateService.selectedUser$;
    this.users$ = this.stateService.users$;
    this.loading$ = this.stateService.loading$;
    this.error$ = this.stateService.error$;
  }

  ngOnInit(): void {
    // Esempio di sottoscrizione a cambiamenti di stato
    const selectedUserSub = this.selectedUser$.subscribe(user => {
      if (user) {
        console.log('Nuovo utente selezionato:', user);
        // Qui potresti caricare dati correlati all'utente
        // this.loadUserSubscriptions(user.id);
      }
    });

    this.subscriptions.push(selectedUserSub);

    // Carica gli utenti all'avvio
    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Pulisci le sottoscrizioni
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carica la lista degli utenti dal server
   */
  loadUsers(): void {
    this.stateService.clearError();

    this.dashboardService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Il StateService è già aggiornato dal DashboardService
          this.notificationService.showSuccess('Utenti caricati con successo');
        }
      },
      error: (error) => {
        console.error('Errore nel caricamento degli utenti:', error);
        // L'errore è già gestito dall'ErrorInterceptor
      }
    });
  }

  /**
   * Seleziona un utente
   */
  selectUser(user: User): void {
    this.stateService.setSelectedUser(user);
    this.notificationService.showInfo(`Selezionato: ${user.nome} ${user.cognome}`);
  }

  /**
   * Deseleziona l'utente corrente
   */
  clearSelectedUser(): void {
    this.stateService.setSelectedUser(null);
    this.notificationService.showInfo('Utente deselezionato');
  }

  /**
   * Pulisce l'errore corrente
   */
  clearError(): void {
    this.stateService.clearError();
  }

  /**
   * Mostra esempi di notifiche
   */
  showNotifications(): void {
    this.notificationService.showSuccess('Operazione completata con successo!');

    setTimeout(() => {
      this.notificationService.showWarning('Attenzione: verifica i dati inseriti');
    }, 1000);

    setTimeout(() => {
      this.notificationService.showError('Errore di esempio per testare le notifiche');
    }, 2000);

    setTimeout(() => {
      this.notificationService.showInfo('Informazione generale per l\'utente');
    }, 3000);
  }
}
