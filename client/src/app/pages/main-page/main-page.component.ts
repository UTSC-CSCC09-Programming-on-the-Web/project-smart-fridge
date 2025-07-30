import { Component } from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  forkJoin,
  from,
  map,
  pairwise,
  switchMap,
  tap
} from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { Notification } from '../../models/notification.model';
import { AuthService } from '../../services/auth.service';
import { FridgeService } from '../../services/fridge.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  standalone: false,
})
export class MainPageComponent {
  currentFridge: Fridge | null = null;
  private initialFridgeRooms: boolean = false;
  showOverlay: boolean = false;
  overlayMode: 'temp-ingredient-list' | 'recipe-generated' | null = null;


  constructor(
    private authService: AuthService,
    private fridgeService: FridgeService,
    private socketService: SocketService,
    private notificationService: NotificationService,
  ) {
    this.fridgeService.getUserFridges().subscribe();
    this.authService.getCurrentUser().subscribe();
  }

  onLogout(): void {
    this.initialFridgeRooms = false;

    this.socketService.disconnect();
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (err) => {
        console.error('Logout failed', err);
      },
    });
  }

  ngOnInit(): void {
    this.socketService.connectSocket();

    this.fridgeService.fridgesList$
      .pipe(
        //filter(fridges => fridges && fridges.length > 0),
        pairwise(),
        filter(([prev, curr]) => {
          const prevIds = prev
            .map((f) => f.id)
            .sort()
            .join(',');
          const currIds = curr
            .map((f) => f.id)
            .sort()
            .join(',');
          return prevIds !== currIds;
        }),
        map(([prev, curr]) => {
          const prevIds = new Set(prev.map((f) => f.id));
          const currIds = new Set(curr.map((f) => f.id));
          return {
            added: curr.filter(
              (f) => !prevIds.has(f.id) || !this.initialFridgeRooms,
            ) as Fridge[],
            removed: prev.filter((f) => !currIds.has(f.id)) as Fridge[],
            current: curr as Fridge[],
          };
        }),
        switchMap(({ added, removed, current }) => {
          if (removed.length > 0) {
            return forkJoin(
              removed.map((fridge) =>
                from(this.socketService.emit('leaveFridgeRoom', fridge.id)),
              ),
            );
          }
          if (added.length > 0) {
            return forkJoin(
              added.map((fridge) =>
                from(this.socketService.emit('joinFridgeRoom', fridge.id)),
              ),
            ).pipe(
              tap(() => {
                added.forEach((fridge) => {
                  this.notificationService.pushFridgeNotification({
                    message: `[Fridge ${fridge.name}] Initialized fridge.`,
                    type: 'initialization',
                    source: 'fridge',
                    fridgeId: fridge.id,
                  } as Notification);
                });
                this.initialFridgeRooms = true;
              }),
            );
          }
          return from(current as Fridge[]);
        }),
      )
      .subscribe({
        next: (fridges) => console.log('Fridges list updated:', fridges),
        error: (err) => console.error('Error fetching fridges:', err),
      });

    this.fridgeService.currentFridge$
      .pipe(
        distinctUntilChanged((a, b) => a?.id === b?.id),
        tap((fridge) => {
          this.currentFridge = fridge;
        }),
      )
      .subscribe({
        next: (fridge) => {
          console.log('Current fridge updated:', fridge);
        },
        error: (err) => {
          console.error('Error fetching current fridge:', err);
        },
      });
  }
}
