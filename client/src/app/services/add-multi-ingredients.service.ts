import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { getFridgeIdOrFallback } from '../utils/get-fridge-id.util';
import { FridgeService } from './fridge.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddMultiIngredientsService {
  endpoint = environment.apiEndpoint || 'http://localhost:3000';
  constructor(
    private http: HttpClient,
    private fridgeService: FridgeService,
  ) {}

  private finishBatchAddingSubject: Subject<void> = new Subject<void>();
  finishBatchAdding$: Observable<void> =
    this.finishBatchAddingSubject.asObservable();

  notifyFinishBatchAdding(): void {
    this.finishBatchAddingSubject.next();
  }

  // POST /api/fridges/:fridgeId/multiIngredients/imagesUpload
  postImagesToServer(formData: FormData): Observable<any | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    return this.http.post<any>(
      `${this.endpoint}/api/fridges/${fridge_id}/multiIngredients/imagesUpload`,
      formData,
      { withCredentials: true },
    );
  }
}
