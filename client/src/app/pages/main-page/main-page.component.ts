import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FridgeService } from '../../services/fridge.service';
import { Observable } from 'rxjs';
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
    this.socketService.connectSocket();
  }
}
