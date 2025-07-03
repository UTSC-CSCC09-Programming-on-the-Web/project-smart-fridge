import { Component } from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss',
  standalone: false,
})
export class RecipePageComponent {

  recipe: any; 
  constructor(private recipeService: RecipeService) {}

  onGenerateRecipe(): void {
    console.log('Recipe generation triggered');
    this.recipe = "Sample Recipe"; // Simulate recipe generation
    console.log('Generated recipe:', this.recipe);
    this.recipeService.postGenerateRecipe().subscribe({
      next: (response) => {
        console.log('Recipe generated successfully:', response);
        this.recipe = response; 
      }
      , error: (error) => {
        console.error('Error generating recipe:', error);
      }
    });
  }
}
