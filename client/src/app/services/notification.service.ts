import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, tap, of, switchMap, scan } from 'rxjs';
import { Notification } from '../models/notification.model';
import { FridgeService } from './fridge.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private userNotifiReplaySubject$ = new ReplaySubject<Notification>(3);
  private userNotificationsSubject$ = new BehaviorSubject<Notification[]>([]);
  userNotifications$ = this.userNotificationsSubject$.asObservable();

  private fridgeNotificationMap = new Map<string, ReplaySubject<Notification>>();
  private fridgeListMap = new Map<string, BehaviorSubject<Notification[]>>();
  private currentFridgeNotificationsSubject$ = new BehaviorSubject<Notification[]>([]);
  currentFridgeNotifications$ = this.currentFridgeNotificationsSubject$.asObservable();
  private currentFridgeId: string | null = null;

  constructor(private fridgeService: FridgeService) {
    this.userNotifiReplaySubject$.subscribe(notification => {
      if (!notification || !notification.message) {
        return;
      }
      if (!notification.createdAt) {
        notification.createdAt = new Date();
      }
      const currentNotifications = this.userNotificationsSubject$.getValue();
      currentNotifications.push(notification);
      if (currentNotifications.length > 3) {
        currentNotifications.shift(); // Keep only the last 3 notifications
      }
      this.userNotificationsSubject$.next(currentNotifications);
    });

    this.fridgeService.currentFridge$.pipe(
      tap(fridge => {
        if (fridge) {
          this.currentFridgeId = fridge.id;
        } else {
          this.currentFridgeId = null;
        }
      }),
      switchMap(fridge => {
        if (!fridge) return of([]);
        const list$ = this.fridgeListMap.get(fridge.id)?.asObservable();
        return list$ ? list$ : of([]);
      })
    ).subscribe(notifications => {
      this.currentFridgeNotificationsSubject$.next(notifications);
    });
  }
 
  pushFridgeNotification(notification: Notification) {
    const fridgeId = this.currentFridgeId;
    if (!fridgeId) {
      console.error('service:No current fridge ID set for notifications');
      return;
    }
    if (!notification || !notification.message) {
      return;
    }
    if (!notification.createdAt){
      notification.createdAt = new Date();
    }
    // lazy initialization of fridge notification stream
    if (!this.fridgeNotificationMap.has(fridgeId)) {
      console.log('Service: Creating new notification stream for fridge:', fridgeId);
      this.fridgeNotificationMap.set(fridgeId, new ReplaySubject<Notification>(5));
      this.fridgeListMap.set(fridgeId, new BehaviorSubject<Notification[]>([]));

      const buffer: Notification[] = [];
      this.fridgeNotificationMap.get(fridgeId)!.subscribe(notif => {
        buffer.push(notif);
        if (buffer.length > 3) buffer.shift();
        console.log('Service: Buffering fridge notifications:', buffer);
        this.fridgeListMap.get(fridgeId)!.next([...buffer]);
        this.currentFridgeNotificationsSubject$.next([...buffer]);
    });
  }
    console.log('Service: Pushing fridge notification:', notification);
    this.fridgeNotificationMap.get(fridgeId)!.next(notification);
  }

  pushUserNotification(notification: Notification) {
    if (!notification || !notification.message) {
      console.error('Notification is invalid:', notification);
      return;
    }
    if (!notification.createdAt){
      notification.createdAt = new Date();
    }
    console.log('Service: Pushing user notification:', notification);
    this.userNotifiReplaySubject$.next(notification);
  }
}
