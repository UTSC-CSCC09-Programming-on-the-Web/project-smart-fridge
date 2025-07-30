import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //endpoint = 'http://localhost:3000';
  endpoint = environment.apiEndpoint || 'http://localhost:3000';

  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  loginWithGoogle(): void {
    window.location.href = `${this.endpoint}/auth/google`;
  }

  getCurrentUser(): Observable<User | null> {
    return this.http
      .get<any>(`${this.endpoint}/auth/current-user`, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res.success) {
            this.userSubject.next(res.user);
          }
        }),
        catchError((err) => {
          this.userSubject.next(null);
          return of(null);
        }),
      );
  }

  logout(): Observable<any> {
    return this.http
      .get<any>(`${this.endpoint}/auth/logout`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.userSubject.next(null);
          this.router.navigate(['/login']);
        }),
        catchError((err) => {
          return of(null);
        }),
      );
  }

  createCheckoutSession(): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(
      `${this.endpoint}/api/stripe/create-checkout-session`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
