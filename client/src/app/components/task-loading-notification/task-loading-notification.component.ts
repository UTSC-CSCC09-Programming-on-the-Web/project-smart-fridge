import { Component, Input } from '@angular/core';
import { Notification } from '../../models/notification.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-task-loading-notification',
  standalone: false,
  templateUrl: './task-loading-notification.component.html',
  styleUrl: './task-loading-notification.component.scss'
})
export class TaskLoadingNotificationComponent {
 @Input() notification: Notification = { message: '', type: 'info', source: 'system', taskTotalCount: 0, taskCurrentCount: 0 };

  constructor() {}

  closeNotification(): void {
    this.notification.message = '';
    this.notification.type = 'info';
    this.notification.taskTotalCount = 0;
    this.notification.taskCurrentCount = 0;
  }

  getClass(): string {
    if (this.notification.type === 'success' && this.isFinished) {
      console.log('Task finished notification');
      return 'notification-task-finished';
    }else{
      return 'notification-info';
    }
  }

  get Progress(): number {
    const total = this.notification.taskTotalCount;
    const current = this.notification.taskCurrentCount;
    if (total && total > 0 && current) {
      return (current / total) * 100;
    }
    return 0;
  }
  
  get isFinished(): boolean {
    return this.Progress >= 100;
  }
}
