import { Component, OnInit} from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { SocketService } from '../../../services/socket.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Recipe } from '../../../models/recipe.model';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss',
  standalone: false,
})
export class RecipePageComponent {

  recipe: Recipe | null = null; 
  message: string = "";
  constructor(private recipeService: RecipeService, private socketService: SocketService) {}

  onGenerateRecipe(): void {
    console.log('Recipe generation triggered');
    console.log('Generated recipe:', this.recipe);
    this.recipeService.postGenerateRecipe().subscribe({
      next: (response) => {
        console.log('Recipe generated successfully:', response);
        this.message = response.message || "Recipe generation in progress...Waiting...";
      },
      error: (error) => {
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
      next: (raw: string) => {
        console.log('Recipe received:', raw);
        let clean = raw.trim();
        if (clean.startsWith('```json')) {
          clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
        }
        this.recipe = JSON.parse(clean) as Recipe;
        this.message = "Recipe generated successfully!";
      },
      error: (err) => {
        console.error('Error:', err);
    }
  });
  }
}
