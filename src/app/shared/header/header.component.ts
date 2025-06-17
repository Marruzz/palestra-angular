import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Output() logout = new EventEmitter<void>();
  private router = inject(Router);
  onLogout() {
    this.logout.emit();
    this.router.navigate(['/login']);
  }
}
