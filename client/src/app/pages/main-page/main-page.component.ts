import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FridgeService } from '../../services/fridge.service';
import { Observable, distinctUntilChanged, filter, from, switchMap, take, tap } from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { SocketService } from '../../services/socket.service';
import { User } from '../../models/user.model';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  standalone: false,
})
export class MainPageComponent {
  currentFridge: Fridge | null = null;
  currentUser: User | null = null;
  showFridgeInfo: boolean = false;
  showUserInfo: boolean = false;
  showNewFridgeForm: boolean = false;
  showFridgeSelector: boolean = false;
  private previousFridgeId: string | null = null;

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
    console.log('User logged out');
    this.previousFridgeId = null;
    this.showFridgeInfo = false;
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
  
  fetchUserInfo(): void {
    this.showUserInfo = !this.showUserInfo;
  }

  addNewFridge(): void {
    this.showNewFridgeForm = !this.showNewFridgeForm;
  }

  onSubmitNewFridgeForm(): void {
    this.showNewFridgeForm = false;
    this.fridgeService.getUserFridges().subscribe({
      next: () => {
        console.log('New fridge added successfully');
      },
      error: (err) => {
        console.error('Error adding new fridge:', err);
      },
    });
    this.authService.getCurrentUser().subscribe({
      next: () => {
        console.log('User data refreshed after adding new fridge');
      },
      error: (err) => {
        console.error('Error refreshing user data:', err);
      },
    });
  }

  switchFridgeList(): void {
    this.showFridgeSelector = !this.showFridgeSelector;
  }

  ngOnInit(): void {
    this.socketService.connectSocket();
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        console.log('Current user:', user);
      } else {
        console.log('No user logged in');
      }
    });
    this.fridgeService.fridgesList$.pipe(
      filter(fridges => fridges && fridges.length > 0),
      distinctUntilChanged((a, b) => a.length === b.length), 
    ).subscribe(fridges => {
        console.log('User fridges:', fridges);
        fridges.forEach(fridge => {
          this.notificationService.pushFridgeNotification({
            message: `[Fridge ${fridge.name}] Initialized fridge.`,
            type: 'initialization',
            source: 'fridge',
            fridgeId: fridge.id,
          } as Notification);
        });
    });
    this.fridgeService.currentFridge$
      .pipe(
        tap((fridge) => {
          this.currentFridge = fridge;
        }),
        distinctUntilChanged((a, b) => a?.id === b?.id),
        switchMap((fridge) => {
          const ops: Promise<void>[] = [];
          if (this.previousFridgeId) {
            ops.push(
              this.socketService.emit('leaveFridgeRoom', this.previousFridgeId),
            );
          }
          if (fridge && fridge.id && this.previousFridgeId !== fridge.id) {
            console.log(`Start switching/joining to fridge room: ${fridge.id}`);
            ops.push(this.socketService.emit('joinFridgeRoom', fridge.id));
            this.previousFridgeId = fridge.id;
          }
          return from(Promise.all(ops));
        }),
      )
      .subscribe({
        next: () => {
          console.log('Socket to fridge room completed successfully');
        },
        error: (err) => {
          console.error('Error during switch fridge room:', err);
        },
      });
  }
}
