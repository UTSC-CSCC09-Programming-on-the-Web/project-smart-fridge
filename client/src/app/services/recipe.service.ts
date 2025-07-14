import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FridgeService } from './fridge.service';
import { getFridgeIdOrFallback } from '../utils/get-fridge-id.util';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
   endpoint = 'http://localhost:3000';

 constructor(private http: HttpClient, private fridgeService: FridgeService) {}

 // POST /api/recipes/generate
  postGenerateRecipe(): Observable<any> {
      console.log('Generating recipe in recipe service...');
      const fridgeId = getFridgeIdOrFallback(this.fridgeService);
      return this.http.post(`${this.endpoint}/api/recipes/generate`, {fridgeId}, { withCredentials: true });
  }
}

