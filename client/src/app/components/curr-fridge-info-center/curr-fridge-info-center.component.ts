import { Component } from '@angular/core';
import { FridgeService } from '../../services/fridge.service';
import { Observable } from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

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

  constructor(private fridgeService: FridgeService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.fridgeService.currentFridge$.subscribe((fridge) => {
      this.currFridgeInfo = fridge;
    });
    this.notificationService.currentFridgeNotifications$.subscribe((notifications) => {
      this.currFridgeNotifiList = notifications;  
    });
    this.notificationService.userNotifications$.subscribe((notifications) => {
      this.userNotifiList = notifications;
    });
  }

}
