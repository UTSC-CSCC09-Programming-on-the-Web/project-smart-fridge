import { Component } from '@angular/core';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss',
  standalone: false,
})
export class RecipePageComponent {

  recipe: any; 

  onGenerateRecipe(): void {
    console.log('Recipe generation triggered');
    this.recipe = "Sample Recipe"; // Simulate recipe generation
    console.log('Generated recipe:', this.recipe);
  }
}
