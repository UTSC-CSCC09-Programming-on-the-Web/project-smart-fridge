import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  standalone: false,
})
export class LoginPageComponent {
  constructor(private authService: AuthService, private router: Router) {}


  goToGoogleLogin():void{
    this.authService.loginWithGoogle();
  }

  goToMain(): void {
    this.router.navigate(['/first-login']); // use for test 
  }

}
