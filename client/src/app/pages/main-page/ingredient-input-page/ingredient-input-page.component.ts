import { Component, OnInit } from '@angular/core';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-ingredient-input-page',
  templateUrl: './ingredient-input-page.component.html',
  styleUrl: './ingredient-input-page.component.scss',
  standalone: false,
})
export class IngredientInputPageComponent {

  constructor(private addMultiIngredientsService: AddMultiIngredientsService, private socketService: SocketService) {}
  
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' = 'info';

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
  }
}  
