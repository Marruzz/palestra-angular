import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StatsService, CalculatedStats } from './stats.service';
import { StateService } from './state.service';

import {
  User,
  Corso as ICorso,
  ApiResponse,
} from '../models';

// Interfacce aggiornate per il nuovo database schema
export interface PalestraUser {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  data_nascita: string;
  codice_fiscale: string;
  abbonamenti: Abbonamento[];
}

export interface Corso {
  id: number;
  nome_corso: string;
  descrizione?: string;
  durata_mesi_default?: number;
  abbonamenti_attivi?: number;
}

export interface Abbonamento {
  id: number;
  id_utente: number;
  id_corso: number;
  data_inizio: string;
  durata_mesi: number;
  data_fine: string;
  nome?: string;
  cognome?: string;
  email?: string;
  codice_fiscale?: string;
  nome_corso?: string;
  corso_descrizione?: string;
}

export interface Ingresso {
  id: number;
  id_utente: number;
  data_ora: string;
  nome: string;
  cognome: string;
  email?: string;
  nome_utente: string;
}

export interface DashboardStats {
  totale_utenti: number;
  utenti_entrati_oggi: number;
  abbonamenti_attivi: number;
  accessi_oggi: number;
  accessi_settimana: number;
  accessi_mese: number;
  accessi_anno: number;
  accessi_sempre: number;
  corsi_attivi: number;
  totale_abbonamenti: number;
  eta_media_utenti: number;
  tempo_medio_entrata: string;
  durata_media_corso: number;
  corso_bottom: string;
  corso_top: string;
  ultimi_accessi: {
    nome: string;
    cognome: string;
    ultimo_accesso: string;
    totale_accessi_oggi: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private statsService: StatsService,
    private stateService: StateService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }  // Metodi per gestire gli utenti della palestra
  getUsers(): Observable<ApiResponse<User[]>> {
    this.stateService.setLoading(true);
    return this.http
      .get<ApiResponse<User[]>>(
        `${this.apiUrl}/dashboard/users`,
        { headers: this.getHeaders() }
      )
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.stateService.setUsers(response.data);
          }
          this.stateService.setLoading(false);
        }),
        catchError((error) => {
          this.stateService.setLoading(false);
          this.stateService.setError('Errore nel caricamento degli utenti');
          return throwError(() => error);
        })
      );
  }
  createUser(
    user: Partial<PalestraUser>
  ): Observable<{ success: boolean; data?: PalestraUser; message: string }> {
    return this.http
      .post<{ success: boolean; data?: PalestraUser; message: string }>(
        `${this.apiUrl}/dashboard/users`,
        user,
        { headers: this.getHeaders() }
      )
      .pipe(
        tap(response => {
          if (response.success) {
            // Trigger refresh automatico degli utenti
            this.stateService.triggerUsersRefresh();
          }
        }),
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }

  updateUser(
    id: number,
    user: Partial<PalestraUser>
  ): Observable<{ success: boolean; data?: PalestraUser; message: string }> {
    return this.http
      .put<{ success: boolean; data?: PalestraUser; message: string }>(
        `${this.apiUrl}/dashboard/users/${id}`,
        user,
        { headers: this.getHeaders() }
      )
      .pipe(
        tap(response => {
          if (response.success) {
            // Trigger refresh automatico degli utenti
            this.stateService.triggerUsersRefresh();
          }
        }),
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }
  

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.apiUrl}/dashboard/users/${id}`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }
  // Metodi per gestire i corsi
  getCorsi(): Observable<{
    success: boolean;
    data: Corso[];
    message?: string;
  }> {
    return this.http
      .get<{ success: boolean; data: Corso[]; message?: string }>(
        `${this.apiUrl}/dashboard/corsi`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          if (error.status === 0) {
            return throwError(() => new Error('Backend non disponibile'));
          } else if (error.error && error.error.message) {
            return throwError(() => new Error(error.error.message));
          } else {
            return throwError(
              () =>
                new Error(
                  `Errore del server: ${error.status} ${error.statusText}`
                )
            );
          }
        })
      );
  }
  createCorso(
    corso: Partial<Corso>
  ): Observable<{ success: boolean; data?: Corso; message: string }> {
    return this.http
      .post<{ success: boolean; data?: Corso; message: string }>(
        `${this.apiUrl}/dashboard/corsi`,
        corso,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          if (error.status === 0) {
            return throwError(() => new Error('Backend non disponibile'));
          } else if (error.error && error.error.message) {
            return throwError(() => new Error(error.error.message));
          } else {
            return throwError(
              () =>
                new Error(
                  `Errore del server: ${error.status} ${error.statusText}`
                )
            );
          }
        })
      );
  }

  // Metodi per gestire gli abbonamenti
  getSubscriptions(): Observable<{
    success: boolean;
    data: Abbonamento[];
    message?: string;
  }> {
    return this.http
      .get<{ success: boolean; data: Abbonamento[]; message?: string }>(
        `${this.apiUrl}/dashboard/subscriptions`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }

  createSubscription(
    abbonamento: Partial<Abbonamento>
  ): Observable<{ success: boolean; data?: Abbonamento; message: string }> {
    return this.http
      .post<{ success: boolean; data?: Abbonamento; message: string }>(
        `${this.apiUrl}/dashboard/subscriptions`,
        abbonamento,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }

  updateSubscription(
    id: number,
    abbonamento: Partial<Abbonamento>
  ): Observable<{ success: boolean; data?: Abbonamento; message: string }> {
    return this.http
      .put<{ success: boolean; data?: Abbonamento; message: string }>(
        `${this.apiUrl}/dashboard/subscriptions/${id}`,
        abbonamento,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }

  deleteSubscription(
    id: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.apiUrl}/dashboard/subscriptions/${id}`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }

  // Metodi per gestire gli accessi/ingressi
  getAccesses(): Observable<{
    success: boolean;
    data: Ingresso[];
    message?: string;
  }> {
    return this.http
      .get<{ success: boolean; data: Ingresso[]; message?: string }>(
        `${this.apiUrl}/dashboard/accesses`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }

  createAccess(ingresso: {
    id_utente: number;
    data_ora?: string;
  }): Observable<{ success: boolean; data?: Ingresso; message: string }> {
    return this.http
      .post<{ success: boolean; data?: Ingresso; message: string }>(
        `${this.apiUrl}/dashboard/accesses`,
        ingresso,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }
  // Metodi per le statistiche - ora utilizza StatsService
  getDashboardStats(): Observable<{
    success: boolean;
    data: DashboardStats;
    message?: string;
  }> {    return this.statsService.calculateStats().pipe(
      map((stats: CalculatedStats) => ({
        success: true,
        data: stats as DashboardStats,
        message: 'Statistiche calcolate con successo'
      })),
      catchError((error) => {
        return of({
          success: false,
          data: this.getEmptyStats(),
          message: 'Errore nel calcolo delle statistiche'
        });
      })
    );
  }

  private getEmptyStats(): DashboardStats {
    return {
      totale_utenti: 0,
      utenti_entrati_oggi: 0,
      abbonamenti_attivi: 0,
      accessi_oggi: 0,
      accessi_settimana: 0,
      accessi_mese: 0,
      accessi_anno: 0,
      accessi_sempre: 0,
      corsi_attivi: 0,
      totale_abbonamenti: 0,
      eta_media_utenti: 0,
      tempo_medio_entrata: 'N/A',
      durata_media_corso: 0,
      corso_bottom: 'N/A',
      corso_top: 'N/A',
      ultimi_accessi: []
    };
  }
}
