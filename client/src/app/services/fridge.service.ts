import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Fridge } from '../models/fridge.model';
import { environment } from '../../environments/environment';  



interface FridgeResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FridgeService {

  private fridgesListSubject = new BehaviorSubject<Fridge[]>([]);
  public fridgesList$ = this.fridgesListSubject.asObservable();
  private currentFridgeSubject = new BehaviorSubject<Fridge | null>(null);
  public currentFridge$ = this.currentFridgeSubject.asObservable();

  endpoint = environment.apiEndpoint || 'http://localhost:3000';


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
          const fridges = res.fridges || [];
          this.fridgesListSubject.next(fridges);
          if (fridges.length > 0 && !this.currentFridgeSubject.value) {
            this.currentFridgeSubject.next(fridges[0]);
          }
          console.log('User fridges retrieved:', fridges);
        }),
        catchError((err) => {
          console.error('Error retrieving user fridges:', err);
          return of(null);
        }),
      );
  }

  getCurrentFridgeId(): string | null {
    return this.currentFridgeSubject.value?.id || null;
  }

  setCurrentFridge(fridge: Fridge | null): void {
    if (
      fridge &&
      (!this.currentFridgeSubject.value ||
        fridge.id !== this.currentFridgeSubject.value.id)
    ) {
      console.log('Setting next current fridge:', fridge);
      this.currentFridgeSubject.next(fridge);
    }
    if (fridge) {
      console.log('Current fridge set:', fridge);
    } else {
      console.log('Current fridge cleared');
    }
  }
}
