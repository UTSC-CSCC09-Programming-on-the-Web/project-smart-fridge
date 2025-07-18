import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrl: './recipe-form.component.scss',
  standalone: false,
})
export class RecipeFormComponent {
  @Output() generateRecipe = new EventEmitter<void>();
}
