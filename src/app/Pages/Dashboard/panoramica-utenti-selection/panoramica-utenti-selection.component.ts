import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfacce per i dati
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  subscription?: Subscription;
  registrationDate: string;
  lastAccess?: string;
  isActive: boolean;
}

interface Subscription {
  id: number;
  type: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  price: number;
  isActive: boolean;
}

@Component({
  selector: 'app-panoramica-utenti-selection',
  imports: [CommonModule],
  templateUrl: './panoramica-utenti-selection.component.html',
  styleUrl: './panoramica-utenti-selection.component.css'
})
export class PanoramicaUtentiSelection {
  @Input() users: User[] = [];
  @Input() totalUsers: number = 0;
  @Input() activeUsers: number = 0;
  @Output() userEdit = new EventEmitter<User>();
  @Output() userDelete = new EventEmitter<number>();
  @Output() assignSubscription = new EventEmitter<{userId: number, type: 'monthly' | 'quarterly' | 'yearly'}>();

  onEditUser(user: User) {
    this.userEdit.emit(user);
  }

  onDeleteUser(userId: number) {
    this.userDelete.emit(userId);
  }

  onAssignSubscription(userId: number, type: 'monthly' | 'quarterly' | 'yearly') {
    this.assignSubscription.emit({ userId, type });
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}
