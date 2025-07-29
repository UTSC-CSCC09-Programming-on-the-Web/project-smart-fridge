import { Component, Input } from '@angular/core';
import { Notification } from '../../models/notification.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { interval } from 'rxjs';

@Component({
  selector: 'app-notification-bar',
  templateUrl: './notification-bar.component.html',
  styleUrl: './notification-bar.component.scss',
  standalone: false,
})
export class NotificationBarComponent {
  @Input() notification: Notification = {
    message: '',
    type: 'info',
    source: 'system',
  };
  trigger: Date = new Date();
  private timeSub?: Subscription;
  constructor() {}

  ngOnInit(): void {
    this.timeSub = interval(60000).subscribe(() => {
      this.trigger = new Date();
    });
  }

  ngOnDestroy(): void {
    if (this.timeSub) {
      this.timeSub.unsubscribe();
    }
  }

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
