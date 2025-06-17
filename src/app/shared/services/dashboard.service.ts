import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfacce aggiornate per il nuovo database schema
export interface PalestraUser {
  id: number;
  nome: string;
  cognome: string;
  email?: string;
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
  abbonamenti_attivi: number;
  accessi_oggi: number;
  accessi_settimana: number;
  accessi_mese: number;
  accessi_anno: number;
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

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }
  // Metodi per gestire gli utenti della palestra
  getUsers(): Observable<{
    success: boolean;
    data: PalestraUser[];
    message?: string;
  }> {
    return this.http
      .get<{ success: boolean; data: PalestraUser[]; message?: string }>(
        `${this.apiUrl}/dashboard/users`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
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
          console.error('Errore nella chiamata API getCorsi:', error);
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
          console.error('Errore nella chiamata API createCorso:', error);
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

  // Metodi per le statistiche
  getDashboardStats(): Observable<{
    success: boolean;
    data: DashboardStats;
    message?: string;
  }> {
    return this.http
      .get<{ success: boolean; data: DashboardStats; message?: string }>(
        `${this.apiUrl}/dashboard/stats`,
        { headers: this.getHeaders() }
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Backend non disponibile'));
        })
      );
  }
}
