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

  hasMoreData = true; // Indicates if there are more ingredients to load
  loading = false; // Indicates if data is currently being loaded

  // Cursors for pagination
  expireDateCursor: string | null = null; // Cursor for expire_date
  idCursor: number | null = null;

  constructor(private ingredientService: IngredientService) {}

  ngOnInit(): void {
    this.loadInitialIngredients();
  }

  loadInitialIngredients(): void {
    console.log('Loading initial ingredients...');
    this.loading = true;
    this.ingredientService.getIngredients().subscribe({
      next: (data) => {
        console.log('Initial ingredients loaded:', data);
        this.ingredients = this.sortIngredientsByExpireDate(data.ingredients);
        
        this.expireDateCursor = data.nextExpireCursor;
        this.idCursor = data.nextIdCursor;

        this.hasMoreData = !!data.ingredients.length; 
        this.loading = false;
        console.log('Initial cursors set:', {
          expireDateCursor: this.expireDateCursor,
          idCursor: this.idCursor,
        }); 
      },
      error: (err) => {
        console.error('Failed to load initial ingredients', err);
        this.loading = false;
      },
    });
  }

  fetchMoreIngredients(): void {
    console.log('Fetching more ingredients... with cursors:', {
      expireDateCursor: this.expireDateCursor,
      idCursor: this.idCursor,
    });
    this.loading = true;

    this.ingredientService
      .getIngredients(this.expireDateCursor ?? undefined, this.idCursor ?? undefined)
      .subscribe({
        next: (data) => {
          if (!data.ingredients || data.ingredients.length === 0) {
            this.hasMoreData = false;
            return;
          }
          const newItems = data.ingredients.filter(
            ing => !this.ingredients.some(existing => existing.id === ing.id)
          );

          this.ingredients = this.sortIngredientsByExpireDate([
            ...this.ingredients,
            ...newItems
          ]);

          this.expireDateCursor = data.nextExpireCursor;
          this.idCursor = data.nextIdCursor;
          this.loading = false;
          console.log('fetch more cursors set:', {
            expireDateCursor: this.expireDateCursor,
            idCursor: this.idCursor,
          }); 
          if (data.ingredients.length < 10 || !data.nextExpireCursor || !data.nextIdCursor) {
            this.hasMoreData = false; 
          }
        },
        error: (err) => {
          console.error('Failed to fetch more ingredients', err);
          this.loading = false;
        },
    });
  }

  handleNewIngredient(newIngredient: Partial<Ingredient>) {
    newIngredient.fridge_id = "00000000-0000-0000-0000-000000000001"; // placeholder, should be replaced with actual fridge_id
    this.ingredientService
      .createIngredient(newIngredient as Ingredient)
      .subscribe({
        next: (created) => {

          if (!this.shouldAppendToCurrentList(created)) {
            console.log('Ingredient not appended to current list:', created);
            this.ingredients = this.ingredients.filter(ing => ing.id !== created.id);
            return;
          }
          
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
          this.cancelEdit();

          if (!this.shouldAppendToCurrentList(updated)) {
            console.log('Ingredient not appended to current list:', updated);
            this.ingredients = this.ingredients.filter(ing => ing.id !== updated.id);
            return;
          }

          const index = this.ingredients.findIndex(
            (ing) => ing.id === updated.id
          );

          if (index !== -1) {
            this.ingredients[index] = updated;
            this.ingredients = this.sortIngredientsByExpireDate(this.ingredients);
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

  onScrollDown() {
    if (this.hasMoreData && !this.loading) {
      this.fetchMoreIngredients(); 
    }
  }

  // temporary solution, in real application, it should be sorted by the server
  /**
   * Sorts ingredients by expire_date in ascending order.
   * @param ingredients Array of Ingredient objects
   * @returns Sorted array
   */
  private sortIngredientsByExpireDate(ingredients: Ingredient[]): Ingredient[] {
    return ingredients.sort(
      (a, b) => {
        const dateDiff = new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        if (a.id && b.id) {
          return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        }
        return 0;
      }
    );
  }

  shouldAppendToCurrentList(item: Ingredient): boolean {
    if (!this.hasMoreData) return true;
    if (!this.expireDateCursor || !this.idCursor) return true;
    const itemDate = new Date(item.expire_date).getTime();
    const cursorDate = new Date(this.expireDateCursor).getTime();

    return (
      itemDate < cursorDate ||
      (itemDate === cursorDate && item.id < this.idCursor)
    );
  }

  // TrackBy function for better performance in ngFor
  trackById(index: number, ingredient: Ingredient): number {
    return ingredient.id ? ingredient.id : index; 
  }
}
