import { Component, OnInit} from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss',
  standalone: false,
})
export class RecipePageComponent {

  recipe: any; 
  constructor(private recipeService: RecipeService, private socketService: SocketService) {}

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

  ngOnInit(): void {
    this.socketService.on('recipeGenerated', (data: any) => {
      console.log('Recipe generated event received:', data);
      this.recipe = data; 
    });
  }
}
