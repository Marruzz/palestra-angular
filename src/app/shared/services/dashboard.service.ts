import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface PalestraUser {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  data_nascita?: string;
  data_iscrizione: string;
  ultimo_accesso?: string;
  attivo: boolean;
  abbonamento?: Subscription;
}

export interface Subscription {
  id: number;
  user_id: number;
  tipo: 'mensile' | 'trimestrale' | 'annuale';
  data_inizio: string;
  data_fine: string;
  prezzo: number;
  attivo: boolean;
}

export interface Access {
  id: number;
  user_id: number;
  nome_utente: string;
  timestamp: string;
  tipo: 'entrata' | 'uscita';
}

export interface DashboardStats {
  totale_utenti: number;
  utenti_attivi: number;
  abbonamenti_attivi: number;
  accessi_oggi: number;
  ricavi_mensili: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api';
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Dati mock per la modalità demo
  private getMockUsers(): PalestraUser[] {
    return [
      {
        id: 1,
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@email.com',
        telefono: '+39 333 1234567',
        data_iscrizione: '2024-01-15',
        ultimo_accesso: '2024-06-17',
        attivo: true,
        abbonamento: {
          id: 1,
          user_id: 1,
          tipo: 'mensile',
          data_inizio: '2024-06-01',
          data_fine: '2024-06-30',
          prezzo: 49.99,
          attivo: true
        }
      },
      {
        id: 2,
        nome: 'Anna',
        cognome: 'Verdi',
        email: 'anna.verdi@email.com',
        telefono: '+39 333 2345678',
        data_iscrizione: '2024-02-20',
        ultimo_accesso: '2024-06-16',
        attivo: true,
        abbonamento: {
          id: 2,
          user_id: 2,
          tipo: 'annuale',
          data_inizio: '2024-02-20',
          data_fine: '2025-02-20',
          prezzo: 499.99,
          attivo: true
        }
      },
      {
        id: 3,
        nome: 'Giuseppe',
        cognome: 'Bianchi',
        email: 'giuseppe.bianchi@email.com',
        telefono: '+39 333 3456789',
        data_iscrizione: '2024-03-10',
        attivo: false
      }
    ];
  }

  private getMockAccesses(): Access[] {
    return [
      {
        id: 1,
        user_id: 1,
        nome_utente: 'Mario Rossi',
        timestamp: '2024-06-17 08:30:00',
        tipo: 'entrata'
      },
      {
        id: 2,
        user_id: 2,
        nome_utente: 'Anna Verdi',
        timestamp: '2024-06-17 09:15:00',
        tipo: 'entrata'
      },
      {
        id: 3,
        user_id: 1,
        nome_utente: 'Mario Rossi',
        timestamp: '2024-06-17 10:45:00',
        tipo: 'uscita'
      }
    ];
  }

  private getMockStats(): DashboardStats {
    return {
      totale_utenti: 3,
      utenti_attivi: 2,
      abbonamenti_attivi: 2,
      accessi_oggi: 3,
      ricavi_mensili: 549.98
    };
  }

  // Metodi per gestire gli utenti della palestra
  getUsers(): Observable<{ success: boolean; data: PalestraUser[]; message?: string }> {
    return this.http.get<{ success: boolean; data: PalestraUser[]; message?: string }>(
      `${this.apiUrl}/dashboard/users`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, usando dati mock per utenti');
        return of({
          success: true,
          data: this.getMockUsers(),
          message: 'Dati demo (backend non disponibile)'
        });
      })
    );
  }
  createUser(user: Partial<PalestraUser>): Observable<{ success: boolean; data?: PalestraUser; message: string }> {
    return this.http.post<{ success: boolean; data?: PalestraUser; message: string }>(
      `${this.apiUrl}/dashboard/users`,
      user,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, simulando creazione utente');
        const newUser: PalestraUser = {
          id: Date.now(),
          nome: user.nome || '',
          cognome: user.cognome || '',
          email: user.email || '',
          telefono: user.telefono || '',
          data_iscrizione: new Date().toISOString().split('T')[0],
          attivo: user.attivo ?? true
        };
        return of({
          success: true,
          data: newUser,
          message: 'Utente creato (modalità demo)'
        });
      })
    );
  }

  updateUser(id: number, user: Partial<PalestraUser>): Observable<{ success: boolean; data?: PalestraUser; message: string }> {
    return this.http.put<{ success: boolean; data?: PalestraUser; message: string }>(
      `${this.apiUrl}/dashboard/users/${id}`,
      user,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, simulando aggiornamento utente');
        return of({
          success: true,
          message: 'Utente aggiornato (modalità demo)'
        });
      })
    );
  }

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/dashboard/users/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, simulando eliminazione utente');
        return of({
          success: true,
          message: 'Utente eliminato (modalità demo)'
        });
      })
    );
  }

  // Metodi per gestire gli abbonamenti
  getSubscriptions(): Observable<{ success: boolean; data: Subscription[]; message?: string }> {
    return this.http.get<{ success: boolean; data: Subscription[]; message?: string }>(
      `${this.apiUrl}/dashboard/subscriptions`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, usando dati mock per abbonamenti');
        const mockSubscriptions = this.getMockUsers()
          .filter(user => user.abbonamento)
          .map(user => user.abbonamento!);
        return of({
          success: true,
          data: mockSubscriptions,
          message: 'Dati demo (backend non disponibile)'
        });
      })
    );
  }

  createSubscription(subscription: Partial<Subscription>): Observable<{ success: boolean; data?: Subscription; message: string }> {
    return this.http.post<{ success: boolean; data?: Subscription; message: string }>(
      `${this.apiUrl}/dashboard/subscriptions`,
      subscription,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, simulando creazione abbonamento');
        return of({
          success: true,
          message: 'Abbonamento creato (modalità demo)'
        });
      })
    );
  }

  // Metodi per gestire gli accessi
  getAccesses(): Observable<{ success: boolean; data: Access[]; message?: string }> {
    return this.http.get<{ success: boolean; data: Access[]; message?: string }>(
      `${this.apiUrl}/dashboard/accesses`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, usando dati mock per accessi');
        return of({
          success: true,
          data: this.getMockAccesses(),
          message: 'Dati demo (backend non disponibile)'
        });
      })
    );
  }

  createAccess(access: Partial<Access>): Observable<{ success: boolean; data?: Access; message: string }> {
    return this.http.post<{ success: boolean; data?: Access; message: string }>(
      `${this.apiUrl}/dashboard/accesses`,
      access,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, simulando registrazione accesso');
        return of({
          success: true,
          message: 'Accesso registrato (modalità demo)'
        });
      })
    );
  }

  // Metodi per le statistiche
  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats; message?: string }> {
    return this.http.get<{ success: boolean; data: DashboardStats; message?: string }>(
      `${this.apiUrl}/dashboard/stats`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        console.warn('Backend non disponibile, usando dati mock per statistiche');
        return of({
          success: true,
          data: this.getMockStats(),
          message: 'Dati demo (backend non disponibile)'
        });
      })
    );
  }
}
