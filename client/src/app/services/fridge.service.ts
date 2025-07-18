import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface Fridge {
  id: string;
  name: string;
  description: string;
}

interface FridgeResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FridgeService {
  endpoint = 'http://localhost:3000';

  private fridgeSubject = new BehaviorSubject<Fridge | null>(null);
  public currentfridge$ = this.fridgeSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  createFridge(name: string, description: string): Observable<any> {
    const body = { name, description };

    return this.http
      .post<FridgeResponse>(`${this.endpoint}/api/fridges/create`, body, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (res.success) {
            console.log('Fridge created:', res.message);
          }
        }),
        catchError((err) => {
          console.error('Error creating fridge:', err);
          return of(null);
        }),
      );
  }

  joinFridge(fridgeId: string): Observable<any> {
    const body = { fridge_id: fridgeId };

    return this.http
      .post<FridgeResponse>(`${this.endpoint}/api/fridges/join`, body, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          if (res.success) {
            console.log('Joined fridge:', res.message);
          }
        }),
        catchError((err) => {
          console.error('Error joining fridge:', err);
          return of(null);
        }),
      );
  }

  getUserFridges(): Observable<{ success: boolean; fridges: Fridge[] } | null> {
    return this.http
      .get<{
        success: boolean;
        fridges: Fridge[];
      }>(`${this.endpoint}/api/fridges/current`, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (!res.success) {
            console.error('Failed to retrieve user fridges:', res);
            return;
          }
          this.fridgeSubject.next(res.fridges[0] || null);
          console.log('User fridges retrieved:', res.fridges);
        }),
        catchError((err) => {
          console.error('Error retrieving user fridges:', err);
          return of(null);
        }),
      );
  }

  getCurrentFridgeId(): string | null {
    return this.fridgeSubject.value?.id || null;
  }
}
