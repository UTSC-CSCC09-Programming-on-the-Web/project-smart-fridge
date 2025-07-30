import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FridgeService } from './fridge.service';
import { getFridgeIdOrFallback } from '../utils/get-fridge-id.util';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  endpoint = environment.apiEndpoint || 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private fridgeService: FridgeService,
  ) {}

  // POST /api/recipes/generate
  postGenerateRecipe(): Observable<any> {
    const fridgeId = getFridgeIdOrFallback(this.fridgeService);
    return this.http.post(
      `${this.endpoint}/api/recipes/generate`,
      { fridgeId },
      { withCredentials: true },
    );
  }

  // GET /api/recipes/result/:traceId
  getRecipeResult(traceId: string): Observable<any> {
    return this.http.get(`${this.endpoint}/api/recipes/result/${traceId}`, {
      withCredentials: true,
    });
  }
}
