import { Component, OnInit } from '@angular/core';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';
import { SocketService } from '../../../services/socket.service';
import { Ingredient } from '../../../models/ingredient.model';
import { ingredientToFormData } from '../../../utils/form-data.util';
import { forkJoin } from 'rxjs';
import { IngredientService } from '../../../services/ingredient.service';
import {readImageAsDataUrl} from '../../../utils/image.util';

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

  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  tempIngredients: tempIngredient[] = [];
 // formalIngredients: Partial<Ingredient>[] = [{name: 'default name', quantity: 1, unit: 'pcs', expire_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], image_url: 'assets/default-ingredient.png'}];
  formalIngredients: Partial<Ingredient>[] = [];
  handleMultiImagesUploaded(images: File[]): void {
    this.notificationMessage = '';
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
          this.notificationMessage = data.message;
          if (
            data.type === 'success' ||
            data.type === 'error' ||
            data.type === 'info'
          ) {
            this.notificationType = data.type as 'success' | 'error' | 'info';
          } else {
            this.notificationType = 'info';
          }
          console.log(
            `Received CV Task Progress with type: ${this.notificationType} and message: ${this.notificationMessage}`,
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
            image_url: "",
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
    const formDataList: FormData[] = [];
    rawIngredients.forEach((ingredient) => {
      ingredient.image_url = undefined; 
      const formData = ingredientToFormData(ingredient, ingredient.image_file);
      formDataList.push(formData);
    });
    forkJoin(
      // temporary solution to add multiple ingredients
      formDataList.map((formData) =>
        this.ingredientService.createIngredient(formData),
      ),
    ).subscribe({
      next: (responses) => {
        console.log('All ingredients added successfully:', responses);
        this.notificationMessage = 'All ingredients added successfully!';
        this.notificationType = 'success';
        this.tempIngredients = [];
        this.formalIngredients = [];
        this.ingredientService.notifyIngredientsUpdated();
      },
      error: (err) => {
        console.error('Error adding ingredients:', err);
        this.notificationMessage = 'Failed to add some ingredients.';
        this.notificationType = 'error';
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

async submitTempIngredientImageFile(imageFile: File, i: number): Promise<void> {
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
