import { Component } from '@angular/core';
import { FridgeService } from '../../services/fridge.service';
import { distinctUntilChanged, filter, Observable, take, tap } from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-info-center',
  standalone: false,
  templateUrl: './notification-info-center.component.html',
  styleUrl: './notification-info-center.component.scss',
})
export class NotificationInfoCenterComponent {
  currFridgeInfo: Fridge | null = null;
  currFridgeId: string | null = null;
  currFridgeNotifiList: Notification[] = [];
  userNotifiList: Notification[] = [];
  fridgesList: Fridge[] = [];
  currUserId: string | null = null;
  fridgeLockNotif: Notification | null = null;
  showLockNotif: boolean = false;
  fridgeLockNotifMap = new Map<string, Notification>();

  constructor(
    private fridgeService: FridgeService,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fridgeService.currentFridge$
      .pipe(distinctUntilChanged((a, b) => a?.id === b?.id))
      .subscribe((fridge) => {
        this.currFridgeInfo = fridge;
        this.currFridgeId = fridge?.id || null;
        if (
          this.currFridgeId &&
          this.fridgeLockNotifMap.has(this.currFridgeId)
        ) {
          this.fridgeLockNotif =
            this.fridgeLockNotifMap.get(this.currFridgeId) || null;
          this.showLockNotif = this.fridgeLockNotif ? true : false;
        }
      });
    this.fridgeService.fridgesList$
      .pipe(distinctUntilChanged((a, b) => a.length === b.length))
      .subscribe((fridges) => {
        this.fridgesList = fridges;
      });
    this.notificationService.currentFridgeNotifications$.subscribe(
      (notifications) => {
        this.currFridgeNotifiList = notifications;
      },
    );

    this.notificationService.userNotifications$.subscribe((notifications) => {
      this.userNotifiList = notifications;
    });
    this.authService.user$
      .pipe(
        filter((user) => !!user),
        distinctUntilChanged((a, b) => a?.id === b?.id),
        take(1),
      )
      .subscribe((user) => {
        this.currUserId = user.id;
      });

    this.socketService.fromSocketEvent<any>('fridgeUpdatedToUser').subscribe({
      next: (data) => {
        const fridgeName =
          this.fridgesList.find((f) => f.id === data.fridgeId)?.name ||
          'fridge';
        let message = `${data.operation} ${data.ingredientsQty ? data.ingredientsQty + ' ingredients' : 'ingredient'} ${data?.ingredientName || ''} in ${fridgeName}`;
        if (data.type === 'success') message = message + ' successfully';
        else if (data.type === 'error')
          message =
            message + ` with an error${data.error ? ': ' + data.error : ''}`;
        const notification: Notification = {
          type: data.type,
          source: 'user',
          message: message,
          createdAt: new Date(),
        };
        this.notificationService.pushUserNotification(notification);
      },
      error: (err) => {
        console.error('Error handling fridge update notification:', err);
      },
    });

    this.socketService
      .fromSocketEvent<any>('fridgeUpdated')
      .pipe(
        filter(
          (data) => data.type !== 'error' && data.userId !== this.currUserId,
        ),
      )
      .subscribe({
        next: (data) => {
          let message = `User ${data.userName ? data.userName : ''} updated this fridge: ${data.operation} ${data.ingredientsQty ? data.ingredientsQty + ' ingredients' : 'ingredient'} ${data?.ingredientName || ''} `;
          const notification: Notification = {
            type: data.type,
            source: 'fridge',
            message: message,
            fridgeId: data.fridgeId,
            createdAt: new Date(),
          };
          this.notificationService.pushFridgeNotification(notification);
        },
        error: (err) => {
          console.error('Error handling fridge update notification:', err);
        },
      });

    this.socketService
      .fromSocketEvent<any>('fridgeLockEvent')
      .pipe(filter((data) => data.source === 'lock'))
      .subscribe({
        next: (data) => {
          const lockNotif: Notification = {
            type: data.type,
            source: data.source,
            message: data.message,
            fridgeId: data.fridgeId,
            createdAt: new Date(),
          };
          if (data.lock) {
            this.fridgeLockNotifMap.set(data.fridgeId, lockNotif);
          } else {
            this.fridgeLockNotifMap.delete(data.fridgeId);
          }
          if (data.fridgeId === this.currFridgeId) {
            this.fridgeLockNotif = lockNotif;
            this.showLockNotif = data.lock;
          }
        },
        error: (err) => {
          console.error('Error handling fridge lock notification:', err);
        },
      });

    this.socketService.fromSocketEvent<any>('fridgeLockError').subscribe({
      next: (data) => {
        const lockNotif: Notification = {
          type: data.type,
          source: data.source,
          message: data.message,
          fridgeId: data.fridgeId,
          createdAt: new Date(),
        };
        this.fridgeLockNotif = data.source === 'lock' ? lockNotif : null;
      },
      error: (err) => {
        console.error('Error handling fridge lock notification:', err);
      },
    });
    this.socketService
      .fromSocketEvent<any>('userJoinedFridge')
      .pipe(filter((data) => data.userId !== this.currUserId))
      .subscribe({
        next: (data) => {
          const fridgeName =
            this.fridgesList.find((f) => f.id === data.fridgeId)?.name ||
            'fridge';
          const message = `User ${data.userName} joined ${fridgeName}. You can refresh the page to see!`;
          const notification: Notification = {
            type: 'info',
            source: 'fridge',
            message: message,
            fridgeId: data.fridgeId,
            createdAt: new Date(),
          };
          this.notificationService.pushFridgeNotification(notification);
        },
        error: (err) => {
          console.error('Error handling user joined fridge notification:', err);
        },
      });
  }

  get hasUserNotifications(): boolean {
    return (
      this.userNotifiList &&
      this.userNotifiList.length > 0 &&
      this.userNotifiList.some(
        (notifi) => notifi.message && notifi.message !== '',
      )
    );
  }

  get hasFridgeNotifications(): boolean {
    return (
      this.currFridgeNotifiList &&
      this.currFridgeNotifiList.length > 0 &&
      this.currFridgeNotifiList.some(
        (notifi) => notifi.message && notifi.message !== '',
      )
    );
  }
}
