import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: false,
})
export class LoginPageComponent {
  constructor(private router: Router) {}

  goToMain() {
    this.router.navigate(['/main']);
  }
}
