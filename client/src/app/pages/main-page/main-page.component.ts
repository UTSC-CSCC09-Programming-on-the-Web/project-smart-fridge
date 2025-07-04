import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
  standalone: false,
})
export class MainPageComponent {

  constructor(private authService: AuthService) {}

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
}
