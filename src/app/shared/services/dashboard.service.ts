import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Metodi per gestire gli utenti della palestra
  getUsers(): Observable<{ success: boolean; data: PalestraUser[]; message?: string }> {
    return this.http.get<{ success: boolean; data: PalestraUser[]; message?: string }>(
      `${this.apiUrl}/dashboard/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  createUser(user: Partial<PalestraUser>): Observable<{ success: boolean; data?: PalestraUser; message: string }> {
    return this.http.post<{ success: boolean; data?: PalestraUser; message: string }>(
      `${this.apiUrl}/dashboard/users`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  updateUser(id: number, user: Partial<PalestraUser>): Observable<{ success: boolean; data?: PalestraUser; message: string }> {
    return this.http.put<{ success: boolean; data?: PalestraUser; message: string }>(
      `${this.apiUrl}/dashboard/users/${id}`,
      user,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/dashboard/users/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Metodi per gestire gli abbonamenti
  getSubscriptions(): Observable<{ success: boolean; data: Subscription[]; message?: string }> {
    return this.http.get<{ success: boolean; data: Subscription[]; message?: string }>(
      `${this.apiUrl}/dashboard/subscriptions`,
      { headers: this.getAuthHeaders() }
    );
  }

  createSubscription(subscription: Partial<Subscription>): Observable<{ success: boolean; data?: Subscription; message: string }> {
    return this.http.post<{ success: boolean; data?: Subscription; message: string }>(
      `${this.apiUrl}/dashboard/subscriptions`,
      subscription,
      { headers: this.getAuthHeaders() }
    );
  }

  // Metodi per gestire gli accessi
  getAccesses(): Observable<{ success: boolean; data: Access[]; message?: string }> {
    return this.http.get<{ success: boolean; data: Access[]; message?: string }>(
      `${this.apiUrl}/dashboard/accesses`,
      { headers: this.getAuthHeaders() }
    );
  }

  createAccess(access: Partial<Access>): Observable<{ success: boolean; data?: Access; message: string }> {
    return this.http.post<{ success: boolean; data?: Access; message: string }>(
      `${this.apiUrl}/dashboard/accesses`,
      access,
      { headers: this.getAuthHeaders() }
    );
  }

  // Metodi per le statistiche
  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats; message?: string }> {
    return this.http.get<{ success: boolean; data: DashboardStats; message?: string }>(
      `${this.apiUrl}/dashboard/stats`,
      { headers: this.getAuthHeaders() }
    );
  }
}
