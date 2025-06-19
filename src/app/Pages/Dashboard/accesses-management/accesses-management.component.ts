import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Ingresso,
  PalestraUser,
} from '../../../shared/services/dashboard.service';
import { ClassRegisterComponent } from './class-register/class-register.component';

@Component({
  selector: 'app-accesses-management',
  imports: [CommonModule, FormsModule, ClassRegisterComponent],
  templateUrl: './accesses-management.component.html',
  styleUrl: './accesses-management.component.css',
})
export class AccessesManagementComponent implements OnInit, OnChanges {
  @Input() accesses: Ingresso[] = [];
  @Input() users: PalestraUser[] = [];
  @Input() showAccessModal: boolean = false;
  @Input() accessForm: { id_utente: number } = {
    id_utente: 0,
  };
  @Input() stats: any = null;
  @Output() accessModalOpen = new EventEmitter<void>();
  @Output() accessModalClose = new EventEmitter<void>();
  @Output() accessRegister = new EventEmitter<void>();
  @Output() accessFormChange = new EventEmitter<{ id_utente: number }>();
  @Output() accessDelete = new EventEmitter<number>();
  @Output() registerMultipleAccesses = new EventEmitter<number[]>();  // Nuova proprietà per gli ingressi multipli
  showMultipleAccessesModal: boolean = false;

  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalPages: number = 0;
  paginatedAccesses: Ingresso[] = [];

  ngOnInit() {
    this.updatePagination();
  }

  ngOnChanges() {
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.accesses.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAccesses = this.accesses.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(
        1,
        this.currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...'); // Use ellipsis instead of -1
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < this.totalPages) {
        if (endPage < this.totalPages - 1) {
          pages.push('...'); // Use ellipsis instead of -1
        }
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  getDisplayedToIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.accesses.length);
  }

  onOpenAccessModal() {
    this.accessModalOpen.emit();
  }

  onCloseAccessModal() {
    this.accessModalClose.emit();
  }

  onRegisterAccess() {
    this.accessRegister.emit();
  }
  onAccessFormChange() {
    this.accessFormChange.emit(this.accessForm);
  }

  onDeleteAccess(accessId: number) {
    if (confirm('Sei sicuro di voler eliminare questo ingresso?')) {
      this.accessDelete.emit(accessId);
    }
  }
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'Data non valida';
      }

      return date.toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Data non valida';
    }
  }

  getTypeLabel(type: string): string {
    return type === 'entry' ? 'Entrata' : 'Uscita';
  }

  getTypeColor(type: string): string {
    return type === 'entry'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getTypeIcon(type: string): string {
    return type === 'entry'
      ? 'M11 16l-4-4m0 0l4-4m-4 4h14'
      : 'M13 8l4 4m0 0l-4 4m4-4H3';
  }
  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserAccessesTodayCount(userId: number): number {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    return this.accesses.filter((access) => {
      const accessDate = new Date(access.data_ora);
      return (
        access.id_utente === userId &&
        accessDate >= todayStart &&
        accessDate <= todayEnd
      );
    }).length;
  }

  getLastAccessForUser(userId: number): string {
    const userAccesses = this.accesses
      .filter((access) => access.id_utente === userId)
      .sort(
        (a, b) =>
          new Date(b.data_ora).getTime() - new Date(a.data_ora).getTime()
      );

    if (userAccesses.length > 0) {
      return this.formatDateTime(userAccesses[0].data_ora);
    }
    return 'Nessun accesso registrato';
  }

  handlePageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }
  onOpenMultipleAccessesModal(): void {
    this.showMultipleAccessesModal = true;
  }
  
  onCloseMultipleAccessesModal(): void {
    this.showMultipleAccessesModal = false;
  }
  
  onSaveMultipleAccesses(userIds: number[]): void {
    this.registerMultipleAccesses.emit(userIds);
    this.showMultipleAccessesModal = false;
  }
}
