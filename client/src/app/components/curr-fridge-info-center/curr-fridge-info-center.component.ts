import { Component } from '@angular/core';
import { FridgeService } from '../../services/fridge.service';
import { distinctUntilChanged, filter, Observable, take, tap } from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-curr-fridge-info-center',
  standalone: false,
  templateUrl: './curr-fridge-info-center.component.html',
  styleUrl: './curr-fridge-info-center.component.scss'
})
export class CurrFridgeInfoCenterComponent {
  currFridgeInfo: Fridge | null = null;
  currFridgeNotifiList: Notification[] = [];
  userNotifiList: Notification[] = [];
  fridgesList: Fridge[] = [];
  currUserId: string | null = null;

  constructor(private fridgeService: FridgeService, private notificationService: NotificationService, private socketService: SocketService, private authService: AuthService) {}

  ngOnInit(): void {
    this.fridgeService.currentFridge$.pipe(distinctUntilChanged((a, b) => a?.id === b?.id)).subscribe((fridge) => {
      this.currFridgeInfo = fridge;
    });
    this.fridgeService.fridgesList$.pipe(distinctUntilChanged((a, b) => a.length === b.length)).subscribe((fridges) => {
      this.fridgesList = fridges;
    });
    this.notificationService.currentFridgeNotifications$.subscribe((notifications) => {
      this.currFridgeNotifiList = notifications;  
    });
    this.notificationService.userNotifications$.subscribe((notifications) => {
      this.userNotifiList = notifications;
    });
    this.authService.user$.pipe(filter(user => !!user), distinctUntilChanged((a, b) => a?.id === b?.id), take(1)).subscribe((user) => {
      this.currUserId = user.id;
    });

    this.socketService.fromSocketEvent<any>('fridgeUpdatedToUser').subscribe({
      next: (data) => {
        console.log('Received fridge update notification:', data);
         const fridgeName = this.fridgesList.find(f => f.id === data.fridgeId)?.name || 'fridge';
        let message = `${data.operation} ${data.ingredientsQty ? data.ingredientsQty + ' ingredients' : 'ingredient'} ${data?.ingredientName || ''} in ${fridgeName}`;
        if (data.type === 'success') message = message + ' successfully';
        else if (data.type === 'error') message = message + ` with an error${data.error ? ': ' + data.error : ''}`;
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

    this.socketService.fromSocketEvent<any>('fridgeUpdated').pipe(filter(data => data.type !== 'error' && data.userId !== this.currUserId)).subscribe({
      next: (data) => {
        console.log('Received fridge update notification:', data);
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
      }
  }); 
}
}
