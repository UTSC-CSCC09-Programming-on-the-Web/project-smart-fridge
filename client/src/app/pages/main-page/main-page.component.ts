import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FridgeService } from '../../services/fridge.service';
import { Observable, distinctUntilChanged, filter, forkJoin, from, map, pipe, switchMap, take, tap, pairwise } from 'rxjs';
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
      //filter(fridges => fridges && fridges.length > 0),
      pairwise(),
      filter(([prev, curr]) => {
        const prevIds = prev.map(f => f.id).sort().join(',');
        const currIds = curr.map(f => f.id).sort().join(',');
        return prevIds !== currIds;
      }),
      map(([prev, curr]) => {
        const prevIds = new Set(prev.map(f => f.id));
        const currIds = new Set(curr.map(f => f.id));
        return {
          added: curr.filter(f => !prevIds.has(f.id)) as Fridge[],
          removed: prev.filter(f => !currIds.has(f.id)) as Fridge[],
          current: curr as Fridge[],
        };
      }),
      switchMap(({ added, removed, current }) => {
        if (removed.length > 0) {
          console.log('Leaving rooms for removed fridges:', removed.map(f => f.id));
          return forkJoin(removed.map(fridge => from(this.socketService.emit('leaveFridgeRoom', fridge.id))));
        }
        if (added.length > 0) {
          console.log('Joining rooms for added fridges:', added.map(f => f.id));
        return forkJoin(added.map(fridge =>
          from(this.socketService.emit('joinFridgeRoom', fridge.id))
        )).pipe(
          tap(() => {
            console.log('Joined rooms for added fridges:', added.map(f => f.id));
            added.forEach(fridge => {
              this.notificationService.pushFridgeNotification({
                message: `[Fridge ${fridge.name}] Initialized fridge.`,
                type: 'initialization',
                source: 'fridge',
                fridgeId: fridge.id,
              } as Notification);
            });
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

    this.fridgeService.currentFridge$.pipe(
      distinctUntilChanged((a, b) => a?.id === b?.id),
      tap(fridge => {
        this.currentFridge = fridge;
      }),
    ).subscribe({
      next: (fridge) => {
        console.log('Current fridge updated:', fridge);
      },
      error: (err) => {
        console.error('Error fetching current fridge:', err);
      },
    });

  }
}
