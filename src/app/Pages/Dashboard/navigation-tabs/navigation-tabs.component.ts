import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation-tabs',
  imports: [CommonModule],
  templateUrl: './navigation-tabs.component.html',
})
export class NavigationTabs {  @Input() currentView:
    | 'users'
    | 'subscriptions'
    | 'active-subscriptions'
    | 'accesses'
    | 'stats'
    | 'corsi' = 'users';
  @Output() viewChange = new EventEmitter<
    'users' | 'subscriptions' | 'active-subscriptions' | 'accesses' | 'stats' | 'corsi'
  >();

  onTabClick(view: 'users' | 'subscriptions' | 'active-subscriptions' | 'accesses' | 'stats' | 'corsi') {
    this.viewChange.emit(view);
  }
  // Getter per le viste
  get isUsersView() {
    return this.currentView === 'users';
  }
  get isSubscriptionsView() {
    return this.currentView === 'subscriptions';
  }
  get isActiveSubscriptionsView() {
    return this.currentView === 'active-subscriptions';
  }
  get isAccessesView() {
    return this.currentView === 'accesses';
  }
  get isStatsView() {
    return this.currentView === 'stats';
  }
  get isCorsiView() {
    return this.currentView === 'corsi';
  }
}
