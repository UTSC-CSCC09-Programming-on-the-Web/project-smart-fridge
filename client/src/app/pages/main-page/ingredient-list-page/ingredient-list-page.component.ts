import { Component } from '@angular/core';
import { Ingredient } from '../../../models/ingredient.model';
import { IngredientService } from '../../../services/ingredient.service';
import { FridgeService } from '../../../services/fridge.service';
import { Observable } from 'rxjs';
import { Fridge } from '../../../models/fridge.model';
import { NotificationService } from '../../../services/notification.service';
import { Notification } from '../../../models/notification.model';

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

  currentFridge: Fridge | null = null;
  // Cursors for pagination
  expireDateCursor: string | null = null; // Cursor for expire_date
  idCursor: number | null = null;

  constructor(
    private ingredientService: IngredientService,
    private fridgeService: FridgeService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.fridgeService.currentFridge$.subscribe((fridge) => {
      if (fridge) {
        this.currentFridge = fridge;
        this.loadInitialIngredients();
      }
    });
    this.ingredientService.ingredientUpdated$.subscribe(() => {
      console.log('Ingredients updated, reloading...');
      this.ingredients = [];
      this.expireDateCursor = null;
      this.idCursor = null;
      this.hasMoreData = true;
      this.loading = false;
      this.loadInitialIngredients();
    });
  }

  loadInitialIngredients(): void {
    console.log('Loading initial ingredients...');
    this.loading = true;
    this.ingredientService.getIngredients().subscribe({
      next: (data) => {
        if (!data || !data.ingredients) {
          console.error('No ingredients data received');
          this.loading = false;
          return;
        }
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
      .getIngredients(
        this.expireDateCursor ?? undefined,
        this.idCursor ?? undefined,
      )
      .subscribe({
        next: (data) => {
          if (!data) {
            console.error('No data received while fetching more ingredients');
            this.loading = false;
            return;
          }
          if (!data.ingredients || data.ingredients.length === 0) {
            console.log('No more ingredients to load');
            this.loading = false;
            this.hasMoreData = false;
            return;
          }
          const newItems = data.ingredients.filter(
            (ing) =>
              !this.ingredients.some((existing) => existing.id === ing.id),
          );

          this.ingredients = this.sortIngredientsByExpireDate([
            ...this.ingredients,
            ...newItems,
          ]);

          this.expireDateCursor = data.nextExpireCursor;
          this.idCursor = data.nextIdCursor;
          this.loading = false;
          console.log('fetch more cursors set:', {
            expireDateCursor: this.expireDateCursor,
            idCursor: this.idCursor,
          });
          if (
            data.ingredients.length < 10 ||
            !data.nextExpireCursor ||
            !data.nextIdCursor
          ) {
            this.hasMoreData = false;
          }
        },
        error: (err) => {
          console.error('Failed to fetch more ingredients', err);
          this.loading = false;
        },
      });
  }

  handleNewIngredient(formData: FormData) {
    const fridge_id = this.fridgeService.getCurrentFridgeId();
    if (!fridge_id) {
      console.error('Fridge ID is not available');
      return;
    }
    formData.append('fridge_id', fridge_id);
    this.ingredientService.createIngredient(formData as FormData).subscribe({
      next: (created) => {
        if (!created) {
          console.error('Created ingredient is null or undefined');
          return;
        }
        if (!this.shouldAppendToCurrentList(created)) {
          console.log('Ingredient not appended to current list:', created);
          this.ingredients = this.ingredients.filter(
            (ing) => ing.id !== created.id,
          );
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
          if (!updated) {
            console.error('Updated ingredient is null or undefined');
            return;
          }
          // for testing push notifications
          this.notificationService.pushFridgeNotification({
            message: `[Fridge ${this.currentFridge?.name}] Ingredient ${updated.name} updated in the fridge.`,
            type: 'success',
          } as Notification);
          this.notificationService.pushUserNotification({
            message: `Ingredient ${updated.name} updated in your fridge ${this.currentFridge?.name}.`,
            type: 'info',
          } as Notification);
          if (!this.shouldAppendToCurrentList(updated)) {
            console.log('Ingredient not appended to current list:', updated);
            this.ingredients = this.ingredients.filter(
              (ing) => ing.id !== updated.id,
            );
            return;
          }

          const index = this.ingredients.findIndex(
            (ing) => ing.id === updated.id,
          );

          if (index !== -1) {
            this.ingredients[index] = updated;
            this.ingredients = this.sortIngredientsByExpireDate(
              this.ingredients,
            );
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

    this.ingredientService.deleteIngredient(deletedIngredient.id).subscribe({
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

  scrollToTop(): void {
    window.scrollTo({ top: 10, behavior: 'smooth' });
  }

  // following functions are helper

  // temporary solution, in real application, it should be sorted by the server
  /**
   * Sorts ingredients by expire_date in ascending order.
   * @param ingredients Array of Ingredient objects
   * @returns Sorted array
   */
  private sortIngredientsByExpireDate(ingredients: Ingredient[]): Ingredient[] {
    return ingredients.sort((a, b) => {
      const dateDiff =
        new Date(a.expire_date).getTime() - new Date(b.expire_date).getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.id && b.id) {
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      }
      return 0;
    });
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
