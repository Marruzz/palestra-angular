import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatsCards } from '../stats-cards/stats-cards.component';
import { CalculatedStats } from '../../../shared/services/stats.service';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, StatsCards],
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css']
})
export class StatsPageComponent {
  @Input() stats: CalculatedStats | null = null;
  @Input() isLoading = false;
}
