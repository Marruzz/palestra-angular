import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Subscription, Access, Corso } from '../models';

export interface AppState {
  selectedUser: User | null;
  users: User[];
  subscriptions: Subscription[];
  accesses: Access[];
  corsi: Corso[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  selectedUser: null,
  users: [],
  subscriptions: [],
  accesses: [],
  corsi: [],
  loading: false,
  error: null
};

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private state$ = new BehaviorSubject<AppState>(initialState);

  // Public state observables
  public readonly selectedUser$: Observable<User | null> = this.state$.pipe(
    map(state => state.selectedUser)
  );

  public readonly users$: Observable<User[]> = this.state$.pipe(
    map(state => state.users)
  );

  public readonly subscriptions$: Observable<Subscription[]> = this.state$.pipe(
    map(state => state.subscriptions)
  );

  public readonly accesses$: Observable<Access[]> = this.state$.pipe(
    map(state => state.accesses)
  );

  public readonly corsi$: Observable<Corso[]> = this.state$.pipe(
    map(state => state.corsi)
  );

  public readonly loading$: Observable<boolean> = this.state$.pipe(
    map(state => state.loading)
  );

  public readonly error$: Observable<string | null> = this.state$.pipe(
    map(state => state.error)
  );

  // State getters
  get currentState(): AppState {
    return this.state$.value;
  }

  get selectedUser(): User | null {
    return this.currentState.selectedUser;
  }

  // State setters
  setSelectedUser(user: User | null): void {
    this.updateState({ selectedUser: user });
  }

  setUsers(users: User[]): void {
    this.updateState({ users });
  }

  addUser(user: User): void {
    const users = [...this.currentState.users, user];
    this.updateState({ users });
  }

  updateUser(updatedUser: User): void {
    const users = this.currentState.users.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    this.updateState({ users });
  }

  removeUser(userId: number): void {
    const users = this.currentState.users.filter(user => user.id !== userId);
    this.updateState({ users });
  }

  setSubscriptions(subscriptions: Subscription[]): void {
    this.updateState({ subscriptions });
  }

  addSubscription(subscription: Subscription): void {
    const subscriptions = [...this.currentState.subscriptions, subscription];
    this.updateState({ subscriptions });
  }

  updateSubscription(updatedSubscription: Subscription): void {
    const subscriptions = this.currentState.subscriptions.map(sub =>
      sub.id === updatedSubscription.id ? updatedSubscription : sub
    );
    this.updateState({ subscriptions });
  }

  removeSubscription(subscriptionId: number): void {
    const subscriptions = this.currentState.subscriptions.filter(sub => sub.id !== subscriptionId);
    this.updateState({ subscriptions });
  }

  setAccesses(accesses: Access[]): void {
    this.updateState({ accesses });
  }

  addAccess(access: Access): void {
    const accesses = [...this.currentState.accesses, access];
    this.updateState({ accesses });
  }

  setCorsi(corsi: Corso[]): void {
    this.updateState({ corsi });
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  // Reset state
  reset(): void {
    this.state$.next(initialState);
  }

  private updateState(partial: Partial<AppState>): void {
    this.state$.next({
      ...this.currentState,
      ...partial
    });
  }
}

// Helper function to import map operator
import { map } from 'rxjs/operators';
