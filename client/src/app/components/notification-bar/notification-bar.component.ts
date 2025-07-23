import { Component, Input } from '@angular/core';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrl: './notification-bar.component.scss',
  standalone: false,
})
export class NotificationBarComponent {
  @Input() notification: Notification = { message: '', type: 'info' };

  constructor() {}

  getNotificationClass(): string {
    switch (this.notification.type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'info':
        return 'notification-info';
      default:
        return '';
    }
  }
  closeNotification(): void {
    this.notification.message = '';
  }
}
