import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfacce
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

interface UserForm {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent {
  @Input() users: User[] = [];
  @Input() showUserModal: boolean = false;
  @Input() userForm: UserForm = {
    id: 0,
    name: '',
    email: '',
    phone: '',
    isActive: true
  };
  @Input() selectedUser: User | null = null;

  @Output() userModalOpen = new EventEmitter<User | undefined>();
  @Output() userModalClose = new EventEmitter<void>();
  @Output() userSave = new EventEmitter<void>();
  @Output() userDelete = new EventEmitter<number>();
  @Output() assignSubscription = new EventEmitter<{userId: number, type: 'monthly' | 'quarterly' | 'yearly'}>();
  @Output() userFormChange = new EventEmitter<UserForm>();

  // Stato locale per il menu di assegnazione
  showAssignMenu: number | null = null;

  onOpenUserModal(user?: User) {
    this.userModalOpen.emit(user);
  }

  onCloseUserModal() {
    this.userModalClose.emit();
  }

  onSaveUser() {
    this.userSave.emit();
  }

  onDeleteUser(userId: number) {
    this.userDelete.emit(userId);
  }

  onAssignSubscription(userId: number, type: 'monthly' | 'quarterly' | 'yearly') {
    this.assignSubscription.emit({ userId, type });
    this.showAssignMenu = null; // Chiudi il menu dopo l'assegnazione
  }

  onUserFormChange() {
    this.userFormChange.emit(this.userForm);
  }

  toggleAssignMenu(userId: number) {
    this.showAssignMenu = this.showAssignMenu === userId ? null : userId;
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}
