import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  PalestraUser,
  DashboardStats,
} from '../../../shared/services/dashboard.service';

@Component({
  selector: 'app-panoramica-utenti-selection',
  imports: [CommonModule],
  templateUrl: './panoramica-utenti-selection.component.html',
})
export class PanoramicaUtentiSelection {
  @Input() users: PalestraUser[] = [];
  @Input() stats: DashboardStats | null = null;
  @Output() userEdit = new EventEmitter<PalestraUser>();
  @Output() userDelete = new EventEmitter<PalestraUser>();

  onEditUser(user: PalestraUser) {
    this.userEdit.emit(user);
  }

  onDeleteUser(user: PalestraUser) {
    this.userDelete.emit(user);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }
}
