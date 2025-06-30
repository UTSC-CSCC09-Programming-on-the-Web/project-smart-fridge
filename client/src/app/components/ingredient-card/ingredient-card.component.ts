// ingredient-card.component.ts
import { Component, Input } from '@angular/core';
import { Ingredient } from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-card',
  templateUrl: './ingredient-card.component.html',
  styleUrls: ['./ingredient-card.component.scss'],
  standalone: false,
})
export class IngredientCardComponent {
  @Input() ingredient!: Ingredient;
}
