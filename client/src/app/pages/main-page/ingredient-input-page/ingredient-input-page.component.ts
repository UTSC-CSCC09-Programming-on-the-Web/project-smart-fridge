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
  ) {}

  notification: Notification = {type: 'info', message: ''};
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
          if (
            data.type === 'success' ||
            data.type === 'error' ||
            data.type === 'info'
          ) {
            this.notification.type = data.type as 'success' | 'error' | 'info';
          } else {
            this.notification.type = 'info';
          }
          console.log(
            `Received CV Task Progress with type: ${this.notification.type} and message: ${this.notification.message}`,
          );
        },
        error: (err) => {
          console.error('Error receiving CV Task Progress:', err);
        },
      });
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
        this.notification.message = 'All ingredients added successfully!';
        this.notification.type = 'success';
        this.tempIngredients = [];
        this.formalIngredients = [];
        this.ingredientService.notifyIngredientsUpdated();
      },
      error: (err) => {
        console.error('Error adding ingredients:', err);
        this.notification.message = 'Failed to add some ingredients.';
        this.notification.type = 'error';
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
