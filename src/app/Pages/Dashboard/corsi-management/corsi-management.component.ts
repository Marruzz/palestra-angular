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

import { Corso } from '../../../shared/services/dashboard.service';

@Component({
  selector: 'app-corsi-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './corsi-management.component.html',
  styleUrls: ['./corsi-management.component.css'],
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
      this.filteredCorsi = this.corsi.filter(
        (corso) =>
          corso.nome_corso
            ?.toLowerCase()
            .includes(this.corsoSearchTerm.toLowerCase()) ||
          corso.descrizione
            ?.toLowerCase()
            .includes(this.corsoSearchTerm.toLowerCase())
      );
    }
  }

  getProgressPercentage(corso: Corso): number {
    // Using available properties from Corso interface
    // If abbonamenti_attivi exists, use it, otherwise return a default value
    if (corso.abbonamenti_attivi !== undefined) {
      // Assuming a max of 30 for visualization purposes - adjust as needed
      const maxCapacity = 30;
      return Math.min(
        Math.round((corso.abbonamenti_attivi / maxCapacity) * 100),
        100
      );
    }

    return 0;
  }

  getCourseType(corso: Corso): string {
    const courseName = corso.nome_corso?.toLowerCase() || '';

    if (
      courseName.includes('arti marziali') ||
      courseName.includes('karate') ||
      courseName.includes('judo') ||
      courseName.includes('taekwondo') ||
      courseName.includes('kung fu') ||
      courseName.includes('aikido')
    ) {
      return 'Arti Marziali';
    } else if (
      courseName.includes('mma') ||
      courseName.includes('mixed martial arts') ||
      courseName.includes('bjj') ||
      courseName.includes('brazilian jiu jitsu')
    ) {
      return 'MMA';
    } else if (
      courseName.includes('sala pesi') ||
      courseName.includes('bodybuilding') ||
      courseName.includes('powerlifting') ||
      courseName.includes('pesi')
    ) {
      return 'Sala Pesi';
    } else if (
      courseName.includes('cross') ||
      courseName.includes('crossfit') ||
      courseName.includes('functional') ||
      courseName.includes('hiit')
    ) {
      return 'Cross-training';
    }

    return 'Generale';
  }

  getCourseColors(corso: Corso): {
    bg: string;
    icon: string;
    progress: string;
    badge: string;
  } {
    const courseType = this.getCourseType(corso);

    switch (courseType) {
      case 'Arti Marziali':
        return {
          bg: 'from-red-500 to-orange-600',
          icon: 'from-red-500 to-orange-600',
          progress: 'from-red-500 to-orange-600',
          badge: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'Sala Pesi':
        return {
          bg: 'from-green-500 to-emerald-600',
          icon: 'from-green-500 to-emerald-600',
          progress: 'from-green-500 to-emerald-600',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case  'MMA':
        return {
          bg: 'from-yellow-500 to-green-600',
          icon: 'from-yellow-500 to-green-600',
          progress: 'from-yellow-500 to-green-600',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'Cross-training':
        return {
          bg: 'from-orange-500 to-yellow-600',
          icon: 'from-orange-500 to-yellow-600',
          progress: 'from-orange-500 to-yellow-600',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      default:
        return {
          bg: 'from-gray-600 to-slate-700',
          icon: 'from-gray-600 to-slate-700',
          progress: 'from-gray-600 to-slate-700',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
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
