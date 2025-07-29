import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-credit-page',
  standalone: false,
  templateUrl: './credit-page.component.html',
  styleUrl: './credit-page.component.scss',
})
export class CreditPageComponent {

  constructor(private router: Router) {}

  goBack(){
    this.router.navigate(['/main']);
  }
}
