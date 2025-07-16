import { Component, OnInit} from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { SocketService } from '../../../services/socket.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';

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
    this.socketService.fromSocketEvent<string>('recipeGenerated')
    .pipe(
      switchMap((traceId: string) => {
        console.log('Subscribing to recipe result with traceId:', traceId);
        return this.recipeService.getRecipeResult(traceId);
      })
    )
    .subscribe({
      next: (recipe) => {
        console.log('Recipe received:', recipe);
        this.recipe = recipe;
      },
      error: (err) => {
        console.error('Error:', err);
    }
  });
  }
}
