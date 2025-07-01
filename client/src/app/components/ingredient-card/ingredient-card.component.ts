// ingredient-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';

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
  onDeleteIngredient(): void {
    this.deleteIngredient.emit(this.ingredient);
    console.log('Delete ingredient:', this.ingredient);
  }
}
