import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PalestraUser } from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-class-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-register.component.html',
  styleUrls: ['./class-register.component.css']
})
export class ClassRegisterComponent implements OnChanges {
  @Input() users: PalestraUser[] = [];
  @Input() showModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveAccesses = new EventEmitter<number[]>();
  
  selectedUsers: { id: number, isPresent: boolean }[] = [];
  searchTerm: string = '';
  filteredUsers: PalestraUser[] = [];
  
  ngOnChanges() {
    this.filteredUsers = [...this.users];
    this.initializeSelectedUsers();
  }
  
  initializeSelectedUsers() {
    this.selectedUsers = this.users.map(user => ({
      id: user.id,
      isPresent: false
    }));
  }
  
  // Metodi helper per l'HTML
  isUserSelected(userId: number): boolean {
    const user = this.selectedUsers.find(u => u.id === userId);
    return user ? user.isPresent : false;
  }
  
  getSelectedUsersCount(): number {
    return this.selectedUsers.filter(u => u.isPresent).length;
  }
  
  hasNoSelectedUsers(): boolean {
    return this.getSelectedUsersCount() === 0;
  }
  
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.nome.toLowerCase().includes(term) || 
      user.cognome.toLowerCase().includes(term) || 
      user.codice_fiscale.toLowerCase().includes(term) ||
      `${user.nome} ${user.cognome}`.toLowerCase().includes(term)
    );
  }
  
  toggleUserPresence(userId: number) {
    const userIndex = this.selectedUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.selectedUsers[userIndex].isPresent = !this.selectedUsers[userIndex].isPresent;
    }
  }
  
  toggleAllUsers(isPresent: boolean) {
    this.selectedUsers = this.selectedUsers.map(user => ({
      ...user,
      isPresent
    }));
  }
  
  onCancel() {
    this.close.emit();
  }
  
  onSave() {
    const presentUserIds = this.selectedUsers
      .filter(user => user.isPresent)
      .map(user => user.id);
    
    if (presentUserIds.length > 0) {
      this.saveAccesses.emit(presentUserIds);
    } else {
      // Se nessun utente è selezionato, chiudi semplicemente la modale
      this.close.emit();
    }
  }
}
