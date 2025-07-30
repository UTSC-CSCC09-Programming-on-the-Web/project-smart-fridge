import { Component, ElementRef, ViewChild } from '@angular/core';
import { Fridge } from '../../../models/fridge.model';
import { Ingredient } from '../../../models/ingredient.model';
import { FridgeService } from '../../../services/fridge.service';
import { IngredientService } from '../../../services/ingredient.service';
import { NotificationService } from '../../../services/notification.service';

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

  showAddForm = false;
  @ViewChild('scrollableDiv') containerRef!: ElementRef;

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
      this.ingredients = [];
      this.expireDateCursor = null;
      this.idCursor = null;
      this.hasMoreData = true;
      this.loading = false;
      this.loadInitialIngredients();
    });
  }

  refreshIngredients() {
    this.ingredientService.notifyIngredientsUpdated();
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      window.scrollBy({ top: 200, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: -200, behavior: 'smooth' });
    }
  }

  loadInitialIngredients(): void {
    this.loading = true;
    this.hasMoreData = true;
    this.ingredientService.getIngredients().subscribe({
      next: (data) => {
        if (!data || !data.ingredients) {
          console.error('No ingredients data received');
          this.loading = false;
          return;
        }
        this.ingredients = this.sortIngredientsByExpireDate(data.ingredients);

        this.expireDateCursor = data.nextExpireCursor;
        this.idCursor = data.nextIdCursor;

        if (
          data.ingredients.length < 10 ||
          !data.nextExpireCursor ||
          !data.nextIdCursor
        ) {
          console.log('No more data to load');
          this.hasMoreData = false;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load initial ingredients', err);
        this.loading = false;
      },
    });
  }

  fetchMoreIngredients(): void {
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
          if (
            data.ingredients.length < 10 ||
            !data.nextExpireCursor ||
            !data.nextIdCursor
          ) {
            console.log('No more data to load');
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
          if (!this.shouldAppendToCurrentList(updated)) {
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
    this.editingIngredient = ingredient;
    if (this.editingIngredient && this.editingIngredient.id === ingredient.id) {
      this.containerRef.nativeElement.scrollBy({
        top: 150,
        behavior: 'smooth',
      });
    }
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
    window.scrollTo({ top: 300, behavior: 'smooth' });
    this.containerRef.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // following functions are helper

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
