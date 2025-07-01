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

  // Event emitters for updating and deleting ingredients
  @Output() updateIngredient = new EventEmitter<Ingredient>();
  @Output() deleteIngredient = new EventEmitter<Ingredient>();

  onUpdateIngredient(): void {
    // will change to toggle the update form to edit the ingredient
    // for now, it will emit the ingredient to be updated
    // this is a placeholder, in real application, it should open a form to edit the ingredient
    // and then emit the updated ingredient
    this.updateIngredient.emit(this.ingredient);
    console.log('Update ingredient:', this.ingredient);
  }

  constructor(private dialog: MatDialog) {}

  onDeleteIngredient(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Delete Ingredient',
      message: `Are you sure you want to delete ${this.ingredient.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // If the user confirmed the deletion, emit the delete event
      this.deleteIngredient.emit(this.ingredient);
      console.log('Confirmed deletion of ingredient:', this.ingredient);
    }
  });
  }
}
