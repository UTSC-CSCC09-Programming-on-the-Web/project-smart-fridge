import { Component, OnInit } from '@angular/core';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';
import { SocketService } from '../../../services/socket.service';
import { Ingredient } from '../../../models/ingredient.model';
import { ingredientToFormData } from '../../../utils/form-data.util';
import { forkJoin } from 'rxjs';
import { IngredientService } from '../../../services/ingredient.service';

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

  constructor(private addMultiIngredientsService: AddMultiIngredientsService, private socketService: SocketService, private ingredientService: IngredientService) {}

  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  tempIngredients: tempIngredient[] = [];
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
      error: (err) => console.error('Error uploading images:', err)
    });
  }

  ngOnInit(): void {
    console.log('Ingredient Input Page initialized');
    this.socketService.fromSocketEvent<{ message: string, type: string }>('cvTaskProgress').subscribe({
      next: (data) => {
        this.notificationMessage = data.message;
        if (data.type === 'success' || data.type === 'error' || data.type === 'info') {
          this.notificationType = data.type as 'success' | 'error' | 'info';
        } else {
          this.notificationType = 'info';
        }
        console.log(`Received CV Task Progress with type: ${this.notificationType} and message: ${this.notificationMessage}`);
      },
      error: (err) => {
        console.error('Error receiving CV Task Progress:', err);
      }
    });
    this.socketService.fromSocketEvent<{ traceId: string, result: any }>('addMultiIngredientsFinished').subscribe({
      next: (data) => {
        console.log(`Received addMultiIngredientsFinished with traceId: ${data.traceId} and result:`, data.result);
        let clean = data.result.trim();
        if (clean.startsWith('```json')) {
          clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
        }
        this.tempIngredients = JSON.parse(clean) as tempIngredient[];
        this.formalIngredients = this.tempIngredients.map(ing => ({
          name: ing.name || 'default name', // temporary set
          quantity: parseFloat(ing.quantity) || 1, // temporary set
          unit: ing.unit || 'pcs', // temporary set
          expire_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
        }));
        console.log('Parsed ingredients:', this.formalIngredients);
      },
      error: (err) => {
        console.error('Error receiving addMultiIngredientsFinished:', err);
      }
    });
  }

  addAllIngredients(): void { 
    const rawIngredients = [...this.formalIngredients];
    const formDataList: FormData[] = [];
    rawIngredients.forEach((ingredient) => {
      const formData = ingredientToFormData(ingredient);
      formDataList.push(formData);
    });
    forkJoin(
      // temporary solution to add multiple ingredients
      formDataList.map(formData => this.ingredientService.createIngredient(formData))
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
      }
    }); 
  }
}
