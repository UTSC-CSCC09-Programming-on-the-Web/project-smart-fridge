import { Component } from '@angular/core';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-info-notification-page',
  standalone: false,
  templateUrl: './info-notification-page.component.html',
  styleUrl: './info-notification-page.component.scss',
})
export class InfoNotificationPageComponent {
  currentUser: User | null = null;
  showUserInfo: boolean = false;
  constructor(private authService: AuthService) {}

  fetchUserInfo(): void {
    this.showUserInfo = !this.showUserInfo;
  }

  ngOnInit(): void {
    this.authService.user$.subscribe({
      next: (user: User | null) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Failed to fetch user info', err);
      },
    });
  }
}
