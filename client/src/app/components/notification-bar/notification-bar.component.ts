import { Component, Input} from '@angular/core';

@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrl: './notification-bar.component.scss',
  standalone: false,
})
export class NotificationBarComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'info';

  constructor() {}

  getNotificationClass(): string {
    switch (this.type) {
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
    this.message = '';
  }
}
