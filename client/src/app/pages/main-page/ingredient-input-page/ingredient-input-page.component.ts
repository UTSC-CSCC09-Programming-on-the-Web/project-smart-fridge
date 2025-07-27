import { Component, OnInit } from '@angular/core';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';
import { SocketService } from '../../../services/socket.service';
import { Ingredient } from '../../../models/ingredient.model';
import {
  ingredientToFormData,
  appendIngredientToFormDataWithIndex,
} from '../../../utils/form-data.util';
import { forkJoin } from 'rxjs';
import { IngredientService } from '../../../services/ingredient.service';
import { readImageAsDataUrl } from '../../../utils/image.util';
import { Notification } from '../../../models/notification.model';
import { NotificationService } from '../../../services/notification.service';

interface tempIngredient {
  name: string;
  quantity: string;
  unit: string;
}

@Component({
  selector: 'app-ingredient-input-page',
  templateUrl: './ingredient-input-page.component.html',
  styleUrl: './ingredient-input-page.component.scss',
  standalone: false,
})
export class IngredientInputPageComponent {
  constructor(
    private addMultiIngredientsService: AddMultiIngredientsService,
    private socketService: SocketService,
    private ingredientService: IngredientService,
    private notificationService: NotificationService,
  ) {}

  notification: Notification = {type: 'info', message: '', source: 'task'};
  tempIngredients: tempIngredient[] = [];
  // formalIngredients: Partial<Ingredient>[] = [{name: 'default name', quantity: 1, unit: 'pcs', expire_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], image_url: 'assets/default-ingredient.png'}];
  formalIngredients: Partial<Ingredient>[] = [];
  handleMultiImagesUploaded(images: File[]): void {
    this.notification.message = '';
    console.log('Ingredient Input Page: Images uploaded:', images);
    const formData = new FormData();
    images.forEach((image) => {
      formData.append(`images`, image);
    });
    this.addMultiIngredientsService.postImagesToServer(formData).subscribe({
      next: (response) => console.log('Images uploaded successfully', response),
      error: (err) => console.error('Error uploading images:', err),
    });
  }

  ngOnInit(): void {
    console.log('Ingredient Input Page initialized');
    this.socketService
      .fromSocketEvent<{ message: string; type: string }>('cvTaskProgress')
      .subscribe({
        next: (data) => {
          this.notification.message = data.message;
          this.notification.source = 'task';
          if (
            data.type === 'success' ||
            data.type === 'error' ||
            data.type === 'info'
          ) {
            this.notification.type = data.type as 'success' | 'error' | 'info';
          } else {
            this.notification.type = 'info';
          }
          if (this.notification.type !== 'info') {
            this.notification.createdAt = new Date();
          } else {
            this.notification.createdAt = undefined;
          }
          console.log(
            `Received CV Task Progress with type: ${this.notification.type} and message: ${this.notification.message}`,
          );
        },
        error: (err) => {
          console.error('Error receiving CV Task Progress:', err);
        },
      });
  }

  handleFinishAdding(): void {
    console.log('Finish adding ingredients');
  }
}
