import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Corso } from '../../../shared/services/dashboard.service';

@Component({
  selector: 'app-corsi-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './corsi-management.component.html',
  styleUrls: ['./corsi-management.component.css']
})
export class CorsiManagementComponent {
  @Input() corsi: Corso[] = [];
  @Input() showCorsoModal = false;
  @Input() corsoForm: any = {};
  @Input() selectedCorso: Corso | null = null;
  @Input() isLoading = false;
  @Input() errorMessage = '';

  @Output() corsoModalOpen = new EventEmitter<Corso | null>();
  @Output() corsoModalClose = new EventEmitter<void>();
  @Output() corsoSave = new EventEmitter<void>();
  @Output() corsoDelete = new EventEmitter<Corso>();
  @Output() refreshView = new EventEmitter<void>();

  openCorsoModal(corso?: Corso) {
    this.corsoModalOpen.emit(corso || null);
  }

  closeCorsoModal() {
    this.corsoModalClose.emit();
  }

  saveCorso() {
    this.corsoSave.emit();
  }

  deleteCorso(corso: Corso) {
    this.corsoDelete.emit(corso);
  }

  refreshData() {
    this.refreshView.emit();
  }
}
