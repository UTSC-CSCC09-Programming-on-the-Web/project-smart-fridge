import { Component, OnInit } from '@angular/core';
import { RecipeService } from '../../../services/recipe.service';
import { SocketService } from '../../../services/socket.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { Recipe } from '../../../models/recipe.model';
import { Notification } from '../../../models/notification.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-recipe-page',
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss',
  standalone: false,
})
export class RecipePageComponent {
  recipe: Recipe | null = null;
  notification: Notification = {
    type: 'info',
    message: '',
    source: 'task',
  };
  finishGenerating: boolean = false;
  constructor(
    private recipeService: RecipeService,
    private socketService: SocketService,
    private notificationService: NotificationService,
  ) {}

  recipeCardDisplay: boolean = false;

  onGenerateRecipe(): void {
    this.recipeCardDisplay = true;
    this.finishGenerating = false;
    this.recipeService.postGenerateRecipe().subscribe({
      next: (response) => {
        this.notification.message =
          response.message || 'Recipe generation in progress...Waiting...';
      },
      error: (error) => {
        this.finishGenerating = false;
        this.notificationService.pushUserNotification({
          type: 'error',
          message:
            'Error generating recipe: ' + error + '. Please try again later.',
          source: 'user',
        });
        this.recipeCardDisplay = false;
      },
    });
  }

  ngOnInit(): void {
    this.socketService
      .fromSocketEvent<string>('recipeGenerated')
      .pipe(
        switchMap((traceId: string) => {
          return this.recipeService.getRecipeResult(traceId);
        }),
      )
      .subscribe({
        next: (raw: string) => {
          let clean = raw.trim();
          if (clean.startsWith('```json')) {
            clean = clean
              .replace(/^```json/, '')
              .replace(/```$/, '')
              .trim();
          }
          this.recipe = JSON.parse(clean) as Recipe;
          this.notification.message = 'Recipe generated successfully!';
          this.notification.type = 'success';
          this.finishGenerating = true;
          this.notificationService.pushUserNotification({
            type: 'success',
            message:
              'Your recipe generated successfully! Please check the details.',
            source: 'user',
          });
        },
        error: (err) => {
          if (err.status === 500) {
            this.notification.message =
              'Error generating recipe failed: ' +
              err.message +
              '. Please try again later.';
            this.notification.type = 'error';
            this.finishGenerating = false;
            this.notificationService.pushUserNotification({
              type: 'error',
              message: this.notification.message,
              source: 'user',
            });
            this.recipeCardDisplay = false;
          }
          console.error('Error:', err);
        },
      });
  }
}
