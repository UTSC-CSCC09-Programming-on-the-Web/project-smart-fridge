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
    newIngredient.fridge_id = "00000000-0000-0000-0000-000000000001"; // placeholder, should be replaced with actual fridge_id
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

  handleUpdateIngredient(updatedIngredient: Partial<Ingredient>) {
    if (!updatedIngredient) {
      console.error('updatedIngredient is null or undefined');
      return;
    }
    
    if (!updatedIngredient.id) {
      console.error('Missing ingredient ID for update');
      return;
    }

    this.ingredientService
      .updateIngredient(updatedIngredient.id, updatedIngredient as Ingredient)
      .subscribe({
        next: (updated) => {
          const index = this.ingredients.findIndex(
            (ing) => ing.id === updated.id
          );
          if (index !== -1) {
            this.ingredients[index] = updated;
            this.ingredients = this.sortIngredientsByExpireDate(this.ingredients);
            this.cancelEdit(); // close the edit form after update
          }
        },
        error: (err) => {
          console.error('Failed to update ingredient', err);
        },
      });
  }

  handleDeleteIngredient(deletedIngredient: Ingredient) {
     if (!deletedIngredient.id) {
      console.error('Missing ingredient ID for delete');
      return;
    }

    this.ingredientService
      .deleteIngredient(deletedIngredient.id)
      .subscribe({
      next: () => {
        this.ingredients = this.ingredients.filter(
          (ing) => ing.id !== deletedIngredient.id,
        );
      },
      error: (err) => {
        console.error('Failed to delete ingredient', err);
      },
    });
  }

  editingIngredient: Ingredient | null = null;

  toggleEditForm(ingredient: Ingredient) {
    console.log('Toggling edit form for ingredient:', ingredient);
    this.editingIngredient = ingredient;
  }

  cancelEdit() {
    this.editingIngredient = null;
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
        new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime(),
    );
  }

  // TrackBy function for better performance in ngFor
  trackById(index: number, ingredient: Ingredient): number {
    return ingredient.id ? ingredient.id : index; 
  }
}
