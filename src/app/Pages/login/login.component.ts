import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Inserisci email e password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simula autenticazione
    setTimeout(() => {
      if (this.email === 'admin@palestra.com' && this.password === 'password') {
        this.loginSuccess.emit();
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Credenziali non valide';
      }
      this.isLoading = false;
    }, 1000);
  }
}
