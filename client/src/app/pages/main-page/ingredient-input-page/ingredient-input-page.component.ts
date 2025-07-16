import { Component } from '@angular/core';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';

@Component({
  selector: 'app-ingredient-input-page',
  templateUrl: './ingredient-input-page.component.html',
  styleUrl: './ingredient-input-page.component.scss',
  standalone: false,
})
export class IngredientInputPageComponent {

  constructor(private addMultiIngredientsService: AddMultiIngredientsService) {}

  handleMultiImagesUploaded(images: File[]): void {
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
}
