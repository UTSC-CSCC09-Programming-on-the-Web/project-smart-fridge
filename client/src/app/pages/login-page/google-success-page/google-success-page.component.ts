import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-google-success-page',
  template: `<p>Logging in...</p>`,
})
export class GoogleSuccessPageComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        console.log('User retrieved successfully:', user);
        if (user.user_status === 'need_subscription') {
          this.router.navigate(['/subscribe']);
        } else if (user.user_status === 'first_login') {
          this.router.navigate(['/first-login']);
        } else {
          this.router.navigate(['/main']);
        }
        // if (user.user_status === 'need_subscription') {
        //     this.router.navigate(['/subscribe']);
        console.log('User status:', user.user_status);
      },
      error: () => {
        this.router.navigate(['/auth/google/failure'], {
          queryParams: { error: 'Unable to retrieve user info' },
        });
      },
    });
  }
}
