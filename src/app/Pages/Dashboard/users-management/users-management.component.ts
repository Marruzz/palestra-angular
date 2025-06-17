import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PalestraUser, Corso } from '../../../shared/services/dashboard.service';
import { UserModalComponent } from "./user-modal/user-modal.component";
import { UserCardComponent } from "./user-card/user-card.component";

interface UserForm {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  data_nascita: string;
  codice_fiscale: string;
}

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, FormsModule, UserModalComponent, UserCardComponent],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent {
  @Input() users: PalestraUser[] = [];
  @Input() showUserModal: boolean = false;
  @Input() userForm: UserForm = {
    id: 0,
    nome: '',
    cognome: '',
    email: '',
    data_nascita: '',
    codice_fiscale: ''
  };
  @Input() selectedUser: PalestraUser | null = null;
  @Input() corsi: Corso[] = [];
  @Output() userModalOpen = new EventEmitter<PalestraUser | undefined>();
  @Output() userModalClose = new EventEmitter<void>();
  @Output() userSave = new EventEmitter<any>();
  @Output() userDelete = new EventEmitter<PalestraUser>();

  // Aggiunte per la user card
  showUserCard: boolean = false;
  selectedUserForCard: PalestraUser | null = null;

  onOpenUserModal(user?: PalestraUser) {
    this.userModalOpen.emit(user);
  }

  onCloseUserModal() {
    this.userModalClose.emit();
  }

  onSaveUser(userFormData: any) {
    this.userSave.emit(userFormData);
  }

  onDeleteUser(user: PalestraUser) {
    this.userDelete.emit(user);
  }

  // Nuovi metodi per gestire la user card
  onShowUserCard(user: PalestraUser) {
    this.selectedUserForCard = user;
    this.showUserCard = true;
  }

  onCloseUserCard() {
    this.showUserCard = false;
    this.selectedUserForCard = null;
  }

  onEditFromCard(user: PalestraUser) {
    this.onCloseUserCard();
    this.onOpenUserModal(user);
  }

  getUserInitials(user: PalestraUser): string {
    return `${user.nome[0] || ''}${user.cognome[0] || ''}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }
}
