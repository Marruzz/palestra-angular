import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private idCounter = 0;

  public readonly notifications: Observable<Notification[]> = this.notifications$.asObservable();

  showSuccess(message: string, duration = 5000): void {
    this.addNotification('success', message, duration);
  }

  showError(message: string, duration = 8000): void {
    this.addNotification('error', message, duration);
  }

  showWarning(message: string, duration = 6000): void {
    this.addNotification('warning', message, duration);
  }

  showInfo(message: string, duration = 5000): void {
    this.addNotification('info', message, duration);
  }

  remove(id: string): void {
    const current = this.notifications$.value;
    const updated = current.filter(notification => notification.id !== id);
    this.notifications$.next(updated);
  }

  clear(): void {
    this.notifications$.next([]);
  }

  private addNotification(type: Notification['type'], message: string, duration: number): void {
    const id = `notification-${++this.idCounter}`;
    const notification: Notification = { id, type, message, duration };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);


    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }
}
