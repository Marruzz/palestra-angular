import { Injectable } from '@angular/core';
import { StateService } from './state.service';
import { DashboardService, Abbonamento, Ingresso, Corso as DashboardCorso } from './dashboard.service';
import { NotificationService } from './notification.service';
import { Observable, forkJoin } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {

  constructor(
    private stateService: StateService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {
    // Sottoscrivi ai trigger di refresh
    this.stateService.refreshTrigger.subscribe(type => {
      this.handleRefresh(type);
    });
  }

  /**
   * Gestisce i refresh in base al tipo richiesto
   */
  private handleRefresh(type: 'users' | 'subscriptions' | 'accesses' | 'corsi' | 'all'): void {
    switch (type) {
      case 'users':
        this.refreshUsers();
        break;
      case 'subscriptions':
        this.refreshSubscriptions();
        break;
      case 'accesses':
        this.refreshAccesses();
        break;
      case 'corsi':
        this.refreshCorsi();
        break;
      case 'all':
        this.refreshAll();
        break;
    }
  }

  /**
   * Ricarica solo gli utenti
   */
  private refreshUsers(): void {
    this.dashboardService.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Utenti ricaricati automaticamente');
        }
      },
      error: (error) => {
        console.error('❌ Errore nel ricaricamento degli utenti:', error);
      }
    });
  }
  /**
   * Ricarica solo gli abbonamenti
   */
  private refreshSubscriptions(): void {
    this.dashboardService.getSubscriptions().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Converti Abbonamento[] in Subscription[]
          const subscriptions = response.data.map(abb => ({
            id: abb.id,
            id_utente: abb.id_utente,
            id_corso: abb.id_corso,
            data_inizio: abb.data_inizio,
            durata_mesi: abb.durata_mesi,
            data_fine: abb.data_fine,
            utente_nome: abb.nome,
            utente_cognome: abb.cognome,
            corso_nome: abb.nome_corso
          }));
          this.stateService.setSubscriptions(subscriptions);
          console.log('✅ Abbonamenti ricaricati automaticamente');
        }
      },
      error: (error) => {
        console.error('❌ Errore nel ricaricamento degli abbonamenti:', error);
      }
    });
  }
  /**
   * Ricarica solo gli accessi
   */
  private refreshAccesses(): void {
    this.dashboardService.getAccesses().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Converti Ingresso[] in Access[]
          const accesses = response.data.map(ing => ({
            id: ing.id,
            id_utente: ing.id_utente,
            data_ora: ing.data_ora,
            utente_nome: ing.nome,
            utente_cognome: ing.cognome
          }));
          this.stateService.setAccesses(accesses);
          console.log('✅ Accessi ricaricati automaticamente');
        }
      },
      error: (error) => {
        console.error('❌ Errore nel ricaricamento degli accessi:', error);
      }
    });
  }

  /**
   * Ricarica solo i corsi
   */
  private refreshCorsi(): void {
    this.dashboardService.getCorsi().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Converti DashboardCorso[] in Corso[]
          const corsi = response.data.map(corso => ({
            id: corso.id,
            nome_corso: corso.nome_corso,
            descrizione: corso.descrizione,
            durata_mesi_default: corso.durata_mesi_default
          }));
          this.stateService.setCorsi(corsi);
          console.log('✅ Corsi ricaricati automaticamente');
        }
      },
      error: (error) => {
        console.error('❌ Errore nel ricaricamento dei corsi:', error);
      }
    });
  }
  /**
   * Ricarica tutti i dati in parallelo
   */
  private refreshAll(): void {
    // Invece di usare forkJoin, chiamiamo i metodi singoli
    // che già gestiscono la conversione dei dati
    this.refreshUsers();
    this.refreshSubscriptions();
    this.refreshAccesses();
    this.refreshCorsi();
    
    console.log('✅ Avviato ricaricamento completo di tutti i dati');
  }

  /**
   * Metodi pubblici per trigger manuali
   */
  public triggerUsersRefresh(): void {
    this.refreshUsers();
  }

  public triggerSubscriptionsRefresh(): void {
    this.refreshSubscriptions();
  }

  public triggerAccessesRefresh(): void {
    this.refreshAccesses();
  }

  public triggerCorsiRefresh(): void {
    this.refreshCorsi();
  }

  public triggerFullRefresh(): void {
    this.refreshAll();
  }
}
