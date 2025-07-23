import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-first-login',
  templateUrl: './frist-login.component.html',
  styleUrls: ['./frist-login.component.scss'],
  standalone: false,
})
export class FristLoginComponent {
  constructor(private router: Router){}

  onSubmitForm(){
    this.router.navigate(['/main']);
  }
}
