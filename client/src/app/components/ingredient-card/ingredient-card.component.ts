// ingredient-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-ingredient-card',
  templateUrl: './ingredient-card.component.html',
  styleUrls: ['./ingredient-card.component.scss'],
  standalone: false,
})
export class IngredientCardComponent {
  @Input() ingredient!: Ingredient;
  @Input() mode: 'view' |  'multi-add' = 'view'; 
  @Input() partialIngredient?: Partial<Ingredient>; 

  // Event emitters for updating and deleting ingredients
  @Output() editRequest = new EventEmitter<Ingredient>();
  @Output() deleteIngredient = new EventEmitter<Ingredient>();

  ingredientDisplay: Partial<Ingredient> = {};

  ngOnInit(): void {
    if (this.mode === 'multi-add') {
      this.ingredientDisplay = { ...this.partialIngredient };
    } else {
      this.ingredientDisplay = { ...this.ingredient };
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/default-ingredient.png';
  }

  onUpdateIngredient(): void {
    // Emit the ingredient to be edited
    // This will be caught by the parent component to toggle the edit form
    // and pre-fill it with the ingredient's current data
    this.editRequest.emit(this.ingredient);
    console.log('ingredient to edit:', this.ingredient);
  }

  constructor(private dialog: MatDialog) {}

  onDeleteIngredient(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Ingredient',
        message: `Are you sure you want to delete ${this.ingredient.name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If the user confirmed the deletion, emit the delete event
        this.deleteIngredient.emit(this.ingredient);
        console.log('Confirmed deletion of ingredient:', this.ingredient);
      }
    });
  }
}
