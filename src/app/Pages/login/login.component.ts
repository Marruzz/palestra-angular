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
          this.errorMessage = 'Impossibile connettersi al server. Verifica che il backend sia attivo.';
        } else {
          this.errorMessage = 'Si è verificato un errore. Riprova più tardi.';
        }
      }
    });
  }
}
