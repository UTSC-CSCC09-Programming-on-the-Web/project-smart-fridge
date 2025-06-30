import { Component } from '@angular/core';
import { Ingredient } from '../../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-list-page',
  templateUrl: './ingredient-list-page.component.html',
  styleUrl: './ingredient-list-page.component.scss',
  standalone: false,
})
export class IngredientListPageComponent {
  ingredients: Ingredient[] = [];
  // this is a mock data, in real application, it should be fetched from the server
  handleNewIngredient(newIngredient: Partial<Ingredient>) {
    const newId = this.ingredients.length + 1;

    const completeIngredient: Ingredient = {
      ...newIngredient,
      id: newId,
      is_expired: false,
      added_at: new Date().toISOString(),
      fridge_id: 'mock-fridge-id',
    } as Ingredient;

    this.ingredients.unshift(completeIngredient);
    // Sort the ingredients by expire_date in ascending order
    // temporary solution, in real application, it should be sorted by the server
    this.ingredients.sort(
      (a, b) =>
        new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime(),
    );
  }
}
