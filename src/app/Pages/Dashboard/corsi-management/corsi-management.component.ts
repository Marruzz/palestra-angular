import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
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
export class CorsiManagementComponent implements OnInit, OnChanges {
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

  // Search functionality
  corsoSearchTerm: string = '';
  filteredCorsi: Corso[] = [];

  ngOnInit() {
    this.filteredCorsi = this.corsi;
  }

  ngOnChanges() {
    this.filteredCorsi = this.corsi;
    this.onCorsoSearch();
  }
  onCorsoSearch(event?: any) {
    if (!this.corsoSearchTerm.trim()) {
      this.filteredCorsi = this.corsi;
    } else {
      this.filteredCorsi = this.corsi.filter(corso =>
        corso.nome_corso?.toLowerCase().includes(this.corsoSearchTerm.toLowerCase()) ||
        corso.descrizione?.toLowerCase().includes(this.corsoSearchTerm.toLowerCase())
      );
    }
  }

  getGroupedCorsi(): Corso[][] {
    const grouped: Corso[][] = [];
    const itemsPerGroup = 3; // Number of items per row/group

    for (let i = 0; i < this.filteredCorsi.length; i += itemsPerGroup) {
      grouped.push(this.filteredCorsi.slice(i, i + itemsPerGroup));
    }

    return grouped;
  }
  getProgressPercentage(corso: Corso): number {
    // Using available properties from Corso interface
    // If abbonamenti_attivi exists, use it, otherwise return a default value
    if (corso.abbonamenti_attivi !== undefined) {
      // Assuming a max of 30 for visualization purposes - adjust as needed
      const maxCapacity = 30;
      return Math.min(Math.round((corso.abbonamenti_attivi / maxCapacity) * 100), 100);
    }

    return 0;
  }

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
