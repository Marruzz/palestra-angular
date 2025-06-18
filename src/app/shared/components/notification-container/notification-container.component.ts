import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div
        *ngFor="let notification of notifications; trackBy: trackByFn"
        class="notification"
        [ngClass]="'notification--' + notification.type"
        (click)="remove(notification.id)"
      >
        <div class="notification__icon">
          <span [innerHTML]="getIcon(notification.type)"></span>
        </div>
        <div class="notification__message">
          {{ notification.message }}
        </div>
        <button class="notification__close" (click)="remove(notification.id); $event.stopPropagation()">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: center;
      min-width: 300px;
      max-width: 500px;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      transition: transform 0.2s ease;
    }

    .notification:hover {
      transform: translateX(-5px);
    }

    .notification--success {
      background: #10b981;
      color: white;
    }

    .notification--error {
      background: #ef4444;
      color: white;
    }

    .notification--warning {
      background: #f59e0b;
      color: white;
    }

    .notification--info {
      background: #3b82f6;
      color: white;
    }

    .notification__icon {
      margin-right: 12px;
      font-size: 18px;
    }

    .notification__message {
      flex: 1;
      font-weight: 500;
    }

    .notification__close {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      margin-left: 12px;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }

    .notification__close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications.subscribe(
      notifications => this.notifications = notifications
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  remove(id: string): void {
    this.notificationService.remove(id);
  }

  trackByFn(index: number, notification: Notification): string {
    return notification.id;
  }

  getIcon(type: Notification['type']): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}
