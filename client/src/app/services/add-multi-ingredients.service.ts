import { Injectable } from '@angular/core';
import { Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { getFridgeIdOrFallback } from '../utils/get-fridge-id.util';
import { FridgeService } from './fridge.service';

@Injectable({
  providedIn: 'root'
})
export class AddMultiIngredientsService {
  endpoint = 'http://localhost:3000'; 
  constructor(private http: HttpClient, private fridgeService: FridgeService) { }


  // POST /api/fridges/:fridgeId/multiIngredients/imagesUpload
  postImagesToServer(formData: FormData): Observable<void | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    return this.http.post<void>(`${this.endpoint}/api/fridges/${fridge_id}/multiIngredients/imagesUpload`, formData, { withCredentials: true });
  }
}  
