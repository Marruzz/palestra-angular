import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();

  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Inserisci email e password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Credenziali di fallback per demo quando il backend non è disponibile
    if (this.email === 'admin@palestra.com' && this.password === 'password') {
      this.isLoading = false;
      
      // Simula un utente admin per la demo
      const mockUser = {
        id: 1,
        email: 'admin@palestra.com',
        nome: 'Amministratore'
      };
      
      // Salva i dati utente nel localStorage per la demo
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'demo_token_' + Date.now());
      
      this.router.navigate(['/dashboard']);
      this.loginSuccess.emit();
      console.log('Login effettuato con successo come admin (modalità demo)');
      return;
    }

    const credentials: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Salva il token se presente
          if (response.token) {
            this.authService.setToken(response.token);
          }

          // Naviga alla dashboard
          this.router.navigate(['/dashboard']);
          this.loginSuccess.emit();

          console.log('Login effettuato con successo:', response.user);
        } else {
          this.errorMessage = response.message || 'Credenziali non valide';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Errore durante il login:', error);

        if (error.status === 401) {
          this.errorMessage = 'Credenziali non valide';
        } else if (error.status === 0) {
          // Backend non disponibile - usa credenziali demo
          if (this.email === 'admin@palestra.com' && this.password === 'password') {
            const mockUser = {
              id: 1,
              email: 'admin@palestra.com',
              nome: 'Amministratore'
            };
            
            localStorage.setItem('current_user', JSON.stringify(mockUser));
            localStorage.setItem('auth_token', 'demo_token_' + Date.now());
            
            this.router.navigate(['/dashboard']);
            this.loginSuccess.emit();
            console.log('Backend non disponibile - login demo effettuato');
            return;
          }
          this.errorMessage = 'Server non disponibile. Usa le credenziali demo: admin@palestra.com / password';
        } else {
          this.errorMessage = 'Si è verificato un errore. Riprova più tardi.';
        }
      }
    });
  }
}
