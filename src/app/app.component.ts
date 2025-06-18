import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NotificationContainerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'palestra-angular';
}
