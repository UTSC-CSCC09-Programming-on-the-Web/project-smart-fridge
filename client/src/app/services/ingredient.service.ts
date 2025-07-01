import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  endpoint = 'http://localhost:3000'; // will be replaced with environment variable

  constructor(private http: HttpClient) {};
  
  /**
   * Fetches all ingredients from the server.
   * @returns An Observable of an array of Ingredient objects.
   */
  getAllIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.endpoint}/api/ingredients`);
  }

  /**
   * Creates a new ingredient on the server.
   * @param ingredient The ingredient object to create.
   * @returns An Observable of the created Ingredient.
   */
  createIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${this.endpoint}/api/ingredients`, ingredient);
  }

  // update ingredient will be implemented later
  // delete ingredient will be implemented later
  // error handling will be implemented later
}
