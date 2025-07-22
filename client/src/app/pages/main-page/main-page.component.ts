import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FridgeService } from '../../services/fridge.service';
import { Observable, distinctUntilChanged, from, switchMap } from 'rxjs';
import { Fridge } from '../../services/fridge.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  standalone: false,
})
export class MainPageComponent {
  currentFridge$: Observable<Fridge | null>;
  showFridgeInfo: boolean = false;
  private previousFridgeId: string | null = null;

  constructor(
    private authService: AuthService,
    private fridgeService: FridgeService,
    private socketService: SocketService,
  ) {
    this.fridgeService.getUserFridges().subscribe();
    this.currentFridge$ = this.fridgeService.currentfridge$;
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

  ngOnInit(): void {
    this.fridgeService.currentfridge$
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
