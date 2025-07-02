import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';


  export interface IngredientPaginationResponse {
  ingredients: Ingredient[];
  nextExpireCursor: string | null;
  nextIdCursor: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  endpoint = 'http://localhost:3000'; // will be replaced with environment variable

  constructor(private http: HttpClient) {}

  /**
   * Fetches all ingredients from the server.
   * @returns An Observable of an array of Ingredient objects.
   */
  getIngredients( expireDateCursor?: string,
  idCursor?: number,
  limit: number = 10): Observable<IngredientPaginationResponse> {
      let params = new HttpParams().set('limit', limit.toString());
      if (expireDateCursor) params = params.set('expireDateCursor', expireDateCursor);
      if (idCursor) params = params.set('idCursor', idCursor.toString());
      console.log('Fetching ingredients with params:', params.toString());
    return this.http.get<IngredientPaginationResponse>(`${this.endpoint}/api/ingredients`, { params });
  }

  /**
   * Creates a new ingredient on the server.
   * @param ingredient The ingredient object to create.
   * @returns An Observable of the created Ingredient.
   */
  createIngredient(ingredient: Ingredient): Observable<Ingredient> {
    return this.http.post<Ingredient>(
      `${this.endpoint}/api/ingredients`,
      ingredient,
    );
  }

  /**
   * Updates an existing ingredient on the server.
   * @param id The ID of the ingredient to update.
   * @param updated The updated ingredient data.
   * @returns An Observable of the updated Ingredient.
   */
  updateIngredient(id: number, updated: Partial<Ingredient>): Observable<Ingredient> {
    return this.http.put<Ingredient>(
      `${this.endpoint}/api/ingredients/${id}`,
      updated,
    );
  }

  /**
   * Deletes an ingredient from the server.
   * @param id The ID of the ingredient to delete.
   * @returns An Observable that completes when the deletion is successful.
   */
  deleteIngredient(id: number): Observable<void> {
    return this.http.delete<void>(    
      `${this.endpoint}/api/ingredients/${id}`,
    );
  } 

  // error handling will be implemented later
}
