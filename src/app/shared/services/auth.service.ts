import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    nome?: string;
  };
  token?: string;
}

export interface User {
  id: number;
  email: string;
  nome?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api'; // URL del tuo backend
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    // Carica i dati utente dal localStorage se presente
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, {
        headers,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            this.currentUser = response.user;
            this.saveUserToStorage(response.user);
          }
        })
      );
  }

  // Metodo per salvare il token di autenticazione
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Metodo per ottenere il token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Metodo per ottenere l'utente corrente
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  // Metodo per verificare se l'utente è autenticato
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    // Accetta anche token demo per la modalità offline
    return token !== null && (user !== null || token.startsWith('demo_token_'));
  }

  // Metodo per logout
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUser = null;
  }

  // Metodi privati per gestire il localStorage
  private saveUserToStorage(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('current_user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
      } catch (error) {
        console.error(
          'Errore nel parsing dei dati utente dal localStorage:',
          error
        );
        localStorage.removeItem('current_user');
      }
    }
  }
}
