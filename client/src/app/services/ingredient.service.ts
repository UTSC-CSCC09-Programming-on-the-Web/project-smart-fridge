import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient.model';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { FridgeService } from './fridge.service';
import { getFridgeIdOrFallback } from '../utils/get-fridge-id.util';
import { environment } from '../../environments/environment';

export interface IngredientPaginationResponse {
  ingredients: Ingredient[];
  nextExpireCursor: string | null;
  nextIdCursor: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class IngredientService {
  endpoint = environment.apiEndpoint || 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private fridgeService: FridgeService,
  ) {}

  private ingredientUpdatedSource = new Subject<void>();
  ingredientUpdated$ = this.ingredientUpdatedSource.asObservable();

  notifyIngredientsUpdated() {
    this.ingredientUpdatedSource.next();
  }
  /**
   * Fetches all ingredients from the server.
   * @returns An Observable of an array of Ingredient objects.
   */
  getIngredients(
    expireDateCursor?: string,
    idCursor?: number,
    limit: number = 10,
  ): Observable<IngredientPaginationResponse | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    let params = new HttpParams().set('limit', limit.toString());
    if (expireDateCursor)
      params = params.set('expireDateCursor', expireDateCursor);
    if (idCursor) params = params.set('idCursor', idCursor.toString());
    return this.http.get<IngredientPaginationResponse>(
      `${this.endpoint}/api/fridges/${fridge_id}/ingredients`,
      { params, withCredentials: true },
    );
  }

  /**
   * Creates a new ingredient on the server.
   * @param ingredient The ingredient object to create.
   * @returns An Observable of the created Ingredient.
   */
  createIngredient(formData: FormData): Observable<Ingredient | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    return this.http.post<Ingredient>(
      `${this.endpoint}/api/fridges/${fridge_id}/ingredients`,
      formData,
      { withCredentials: true },
    );
  }

  createMultiIngredients(formData: FormData): Observable<Ingredient[] | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    return this.http.post<Ingredient[]>(
      `${this.endpoint}/api/fridges/${fridge_id}/ingredients/multi`,
      formData,
      { withCredentials: true },
    );
  }

  /**
   * Updates an existing ingredient on the server.
   * @param id The ID of the ingredient to update.
   * @param updated The updated ingredient data.
   * @returns An Observable of the updated Ingredient.
   */
  updateIngredient(
    id: number,
    updated: Partial<Ingredient>,
  ): Observable<Ingredient | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    return this.http.put<Ingredient>(
      `${this.endpoint}/api/fridges/${fridge_id}/ingredients/${id}`,
      updated,
      { withCredentials: true },
    );
  }

  /**
   * Deletes an ingredient from the server.
   * @param id The ID of the ingredient to delete.
   * @returns An Observable that completes when the deletion is successful.
   */
  deleteIngredient(id: number): Observable<void | null> {
    const fridge_id = getFridgeIdOrFallback(this.fridgeService);
    if (!fridge_id) return of(null);
    return this.http.delete<void>(
      `${this.endpoint}/api/fridges/${fridge_id}/ingredients/${id}`,
      { withCredentials: true },
    );
  }

  // error handling will be implemented later
}
