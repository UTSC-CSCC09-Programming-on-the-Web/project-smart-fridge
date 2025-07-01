import { Component } from '@angular/core';
import { Ingredient } from '../../../models/ingredient.model';
import { IngredientService } from '../../../services/ingredient.service';

@Component({
  selector: 'app-ingredient-list-page',
  templateUrl: './ingredient-list-page.component.html',
  styleUrl: './ingredient-list-page.component.scss',
  standalone: false,
})
export class IngredientListPageComponent {
  ingredients: Ingredient[] = [];

  constructor(private ingredientService: IngredientService) {} 

   ngOnInit(): void {
    this.fetchIngredients();
  }

  // Fetches all ingredients from the server and sorts them by expire_date in ascending order (earliest first).
  // this method is called when the component is initialized (ngOnInit())
  fetchIngredients(): void {
    this.ingredientService.getAllIngredients().subscribe({
      next: (data) => {
        // Sort the ingredients by expire_date in ascending order
        // temporary solution, in real application, it should be sorted by the server
        this.ingredients = this.sortIngredientsByExpireDate(data);
      },
      error: (err) => {
        console.error('Failed to fetch ingredients', err);
      },
    });
  }

    handleNewIngredient(newIngredient: Partial<Ingredient>) {
      this.ingredientService
        .createIngredient(newIngredient as Ingredient)
        .subscribe({
          next: (created) => {
            this.ingredients.unshift(created);
            this.ingredients = this.sortIngredientsByExpireDate(this.ingredients);
          },
          error: (err) => {
            console.error('Failed to create ingredient', err);
          },
        });
  }

  // temporary solution, in real application, it should be sorted by the server
  /**
   * Sorts ingredients by expire_date in ascending order.
   * @param ingredients Array of Ingredient objects
   * @returns Sorted array
   */
  private sortIngredientsByExpireDate(ingredients: Ingredient[]): Ingredient[] {
    return ingredients.sort(
      (a, b) =>
        new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime()
    );
  }
}
