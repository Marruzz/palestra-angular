import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PalestraUser } from '../../../../shared/services/dashboard.service';

@Component({
  selector: 'app-user-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.component.html',
})
export class UserModalComponent implements OnInit {
  @Input() user: PalestraUser | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  showUserModal: boolean = true;
  userForm: any = {
    id: 0,
    nome: '',
    cognome: '',
    email: '',
    data_nascita: '',
    codice_fiscale: ''
  };
  selectedUser: PalestraUser | null = null;

  ngOnInit() {
    this.selectedUser = this.user;
    if (this.user) {
      this.userForm = {
        id: this.user.id,
        nome: this.user.nome,
        cognome: this.user.cognome,
        email: this.user.email || '',
        data_nascita: this.user.data_nascita,
        codice_fiscale: this.user.codice_fiscale
      };
    }
  }

  onCloseUserModal() {
    this.close.emit();
  }

  onSaveUser() {
    this.save.emit(this.userForm);
  }
}
