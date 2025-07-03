import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
   endpoint = 'http://localhost:3000';

 constructor(private http: HttpClient) {}

 // POST /api/recipes/generate
  postGenerateRecipe(): Observable<any> {
      console.log('Generating recipe in recipe service...');
      return this.http.post(`${this.endpoint}/api/recipes/generate`, {});
  }
}

