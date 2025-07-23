import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FridgeService } from '../../services/fridge.service';
import { Observable, distinctUntilChanged, from, switchMap } from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { SocketService } from '../../services/socket.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  standalone: false,
})
export class MainPageComponent {
  currentFridge$: Observable<Fridge | null>;
  currentUser$: Observable<User | null>;
  fridgesList$: Observable<Fridge[] | []>;
  showFridgeInfo: boolean = false;
  showUserInfo: boolean = false;
  showNewFridgeForm: boolean = false;
  showFridgeSelector: boolean = false;
  private previousFridgeId: string | null = null;

  constructor(
    private authService: AuthService,
    private fridgeService: FridgeService,
    private socketService: SocketService,
  ) {
    this.fridgeService.getUserFridges().subscribe();
    this.authService.getCurrentUser().subscribe();
    this.currentFridge$ = this.fridgeService.currentFridge$;
    this.fridgesList$ = this.fridgeService.fridgesList$;
    this.currentUser$ = this.authService.user$;
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

  fetchFridgeInfo(): void {
    this.showFridgeInfo = !this.showFridgeInfo;
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
      }
    });
  }

  switchFridgeList(): void {
    this.showFridgeSelector = !this.showFridgeSelector;
  }

  ngOnInit(): void {
    this.fridgeService.currentFridge$
    .pipe(distinctUntilChanged((a, b) => a?.id === b?.id),
          switchMap((fridge) => {
              const ops : Promise<void>[] = [];
              if (this.previousFridgeId) {
                ops.push(this.socketService.emit('leaveFridgeRoom', this.previousFridgeId));
              }
              if (fridge && fridge.id && this.previousFridgeId !== fridge.id) {
                console.log(`Start switching/joining to fridge room: ${fridge.id}`);
                ops.push(this.socketService.emit('joinFridgeRoom', fridge.id));
                this.previousFridgeId = fridge.id;
              }
              return from(Promise.all(ops));
            }))
    .subscribe({
      next: () => {
        console.log('Socket to fridge room completed successfully');
      },
      error: (err) => {
        console.error('Error during switch fridge room:', err);
    }
    });
  }
}
