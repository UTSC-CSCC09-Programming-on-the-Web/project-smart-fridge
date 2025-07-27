import { Component, EventEmitter, Output } from '@angular/core';

import { AddMultiIngredientsService } from '../../../../services/add-multi-ingredients.service';
import { SocketService } from '../../../../services/socket.service';
import { Ingredient } from '../../../../models/ingredient.model';
import {
  ingredientToFormData,
  appendIngredientToFormDataWithIndex,
} from '../../../../utils/form-data.util';
import { forkJoin } from 'rxjs';
import { IngredientService } from '../../../../services/ingredient.service';
import { readImageAsDataUrl } from '../../../../utils/image.util';
import { Notification } from '../../../../models/notification.model';
import { NotificationService } from '../../../../services/notification.service';

interface tempIngredient {
  name: string;
  quantity: string;
  unit: string;
}

@Component({
  selector: 'app-temp-ingredients-list',
  standalone: false,
  templateUrl: './temp-ingredients-list.component.html',
  styleUrl: './temp-ingredients-list.component.scss'
})
export class TempIngredientsListComponent {
  tempIngredients: tempIngredient[] = [];
  formalIngredients: Partial<Ingredient>[] = [];

  @Output() finishAdding: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private socketService: SocketService,
    private ingredientService: IngredientService,
    private notificationService: NotificationService,
  ) {}
  
  ngOnInit(): void {
    this.socketService
      .fromSocketEvent<{
        traceId: string;
        result: any;
      }>('addMultiIngredientsFinished')
      .subscribe({
        next: (data) => {
          console.log(
            `Received addMultiIngredientsFinished with traceId: ${data.traceId} and result:`,
            data.result,
          );
          let clean = data.result.trim();
          if (clean.startsWith('```json')) {
            clean = clean
              .replace(/^```json/, '')
              .replace(/```$/, '')
              .trim();
          }
          this.tempIngredients = JSON.parse(clean) as tempIngredient[];
          this.formalIngredients = this.tempIngredients.map((ing) => ({
            name: ing.name || 'default name', // temporary set
            quantity: parseFloat(ing.quantity) || 1, // temporary set
            unit: ing.unit || 'pcs', // temporary set
            expire_date: new Date(new Date().setDate(new Date().getDate() + 7))
              .toISOString()
              .split('T')[0],
            image_url: '',
          }));
          const notification: Notification = {
            type: 'success',
            message: 'Ingredients parsed from receipt or shopping list successfully! Please go ahead and review them for adding, the temporary result will lose if you reload the page!',
            source: 'user',
          };
          this.notificationService.pushUserNotification(notification);
          console.log('Parsed ingredients:', this.formalIngredients);
        },
        error: (err) => {
          console.error('Error receiving addMultiIngredientsFinished:', err);
        },
      });
  }

  addAllIngredients(): void {
    const rawIngredients = [...this.formalIngredients];
    const allFormData = new FormData();
    rawIngredients.forEach((ingredient, index) => {
      ingredient.image_url = undefined;
      appendIngredientToFormDataWithIndex(
        allFormData,
        ingredient,
        ingredient.image_file,
        index,
      );
    });
    this.ingredientService.createMultiIngredients(allFormData).subscribe({
      next: (responses) => {
        console.log('All ingredients added successfully:', responses);
        this.tempIngredients = [];
        this.formalIngredients = [];
        this.ingredientService.notifyIngredientsUpdated();
        this.finishAdding.emit();
      },
      error: (err) => {
        console.error('Error adding ingredients:', err);
        this.formalIngredients = this.formalIngredients.map((ing) => ({
          ...ing,
          image_file: undefined, // Reset image file and url after submission even if it fails
          image_url: undefined,
        }));
      },
    });
  }

  editingTempIngredient: Partial<Ingredient> | null = null;
  editingTempIngredientsIndex: number | null = null;

  toggleEditForm(ingredient: Partial<Ingredient>, index: number): void {
    console.log('Toggling edit form for ingredient:', ingredient);
    this.editingTempIngredient = ingredient;
    this.editingTempIngredientsIndex = index;
  }

  cancelEdit() {
    this.editingTempIngredient = null;
    this.editingTempIngredientsIndex = null;
  }

  editTempIngredient(ingredient: Partial<Ingredient>): void {
    if (this.editingTempIngredientsIndex !== null) {
      this.formalIngredients[this.editingTempIngredientsIndex] = {
        ...this.formalIngredients[this.editingTempIngredientsIndex],
        ...ingredient,
      };
    }
    this.cancelEdit();
  }

  deleteTempIngredient(ingredient: Partial<Ingredient>): void {
    this.formalIngredients = this.formalIngredients.filter(
      (ing) => ing !== ingredient,
    );
  }

  addingTempIngredientImage: boolean = false;
  addingTempIngredientsIndex: number | null = null;
  addTempIngredientImage(index: number): void {
    this.addingTempIngredientImage = true;
    this.addingTempIngredientsIndex = index;
  }

  async submitTempIngredientImageFile(
    imageFile: File,
    i: number,
  ): Promise<void> {
    const file = imageFile;
    const previewUrl = await readImageAsDataUrl(file);
    if (this.addingTempIngredientsIndex !== null) {
      this.formalIngredients[i] = {
        ...this.formalIngredients[i],
        image_file: file,
        image_url: previewUrl,
      };
    }
    this.cancelAddTempIngredientImage();
  }

  cancelAddTempIngredientImage(): void {
    this.addingTempIngredientImage = false;
    this.addingTempIngredientsIndex = null;
  }

}
