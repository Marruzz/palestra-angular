import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation-tabs',
  imports: [CommonModule],
  templateUrl: './navigation-tabs.component.html',
  styleUrl: './navigation-tabs.component.css'
})
export class NavigationTabs {
  @Input() currentView: 'users' | 'subscriptions' | 'accesses' | 'stats' | 'corsi' = 'users';
  @Output() viewChange = new EventEmitter<'users' | 'subscriptions' | 'accesses' | 'stats' | 'corsi'>();

  onTabClick(view: 'users' | 'subscriptions' | 'accesses' | 'stats' | 'corsi') {
    this.viewChange.emit(view);
  }

  // Getter per le viste
  get isUsersView() { return this.currentView === 'users'; }
  get isSubscriptionsView() { return this.currentView === 'subscriptions'; }
  get isAccessesView() { return this.currentView === 'accesses'; }
  get isStatsView() { return this.currentView === 'stats'; }
  get isCorsiView() { return this.currentView === 'corsi'; }
}
