import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-google-failure-page',
  template: `
    <div>
      <h2>Login failed</h2>
      <p>{{ errorMessage }}</p>
      <button (click)="goBack()">Back to Login</button>
    </div>
  `,
})
export class GoogleFailurePageComponent implements OnInit {
  errorMessage = 'Unknown error';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['error']) {
        this.errorMessage = decodeURIComponent(params['error']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
