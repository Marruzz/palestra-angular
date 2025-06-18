import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PalestraUser, Corso } from '../../../shared/services/dashboard.service';
import { UserModalComponent } from './user-modal/user-modal.component';
import { UserCardComponent } from './user-card/user-card.component';

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
  styleUrl: './users-management.component.css',
})
export class UsersManagementComponent implements OnChanges {
  @Input() users: PalestraUser[] = [];
  @Input() showUserModal: boolean = false;
  @Input() userForm: UserForm = {
    id: 0,
    nome: '',
    cognome: '',
    email: '',
    data_nascita: '',
    codice_fiscale: '',
  };
  @Input() selectedUser: PalestraUser | null = null;
  @Input() corsi: Corso[] = [];
  @Output() userModalOpen = new EventEmitter<PalestraUser | undefined>();
  @Output() userModalClose = new EventEmitter<void>();
  @Output() userSave = new EventEmitter<any>();
  @Output() userDelete = new EventEmitter<PalestraUser>();


  showUserCard: boolean = false;
  selectedUserForCard: PalestraUser | null = null;

  currentPage: number = 1;
  usersPerPage: number = 5;


  userSearchTerm: string = '';
  filteredUsers: PalestraUser[] = [];

  get totalPages(): number {
    const usersToShow = this.userSearchTerm ? this.filteredUsers : this.users;
    return Math.ceil(usersToShow.length / this.usersPerPage);
  }

  get paginatedUsers(): PalestraUser[] {
    const usersToShow = this.userSearchTerm ? this.filteredUsers : this.users;
    const startIndex = (this.currentPage - 1) * this.usersPerPage;
    const endIndex = startIndex + this.usersPerPage;
    return usersToShow.slice(startIndex, endIndex);
  }

  get totalUsers(): number {
    const usersToShow = this.userSearchTerm ? this.filteredUsers : this.users;
    return usersToShow.length;
  }

  get startUserIndex(): number {
    return (this.currentPage - 1) * this.usersPerPage + 1;
  }

  get endUserIndex(): number {
    const endIndex = this.currentPage * this.usersPerPage;
    return Math.min(endIndex, this.users.length);
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {

      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {

      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, this.currentPage + 2);


      if (endPage - startPage < maxVisiblePages - 1) {
        if (startPage === 1) {
          endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

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

  onUserSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.userSearchTerm = target.value.toLowerCase();

    if (this.userSearchTerm.trim() === '') {
      this.filteredUsers = [];
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.nome.toLowerCase().includes(this.userSearchTerm) ||
        user.cognome.toLowerCase().includes(this.userSearchTerm) ||
        user.email.toLowerCase().includes(this.userSearchTerm) ||
        `${user.nome} ${user.cognome}`.toLowerCase().includes(this.userSearchTerm)
      );
    }


    this.currentPage = 1;
  }

  ngOnChanges(): void {

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }
}
