import { Component, Input } from '@angular/core';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
  standalone: false,
})
export class RecipeCardComponent {
  @Input() recipe: Recipe | null = null;
  @Input() message: string = '';
  @Input() generateFinish: boolean = false;
}
