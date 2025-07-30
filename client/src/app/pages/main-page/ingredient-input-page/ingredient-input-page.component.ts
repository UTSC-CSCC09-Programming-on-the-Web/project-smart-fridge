import { Component, EventEmitter, Output } from '@angular/core';
import { Notification } from '../../../models/notification.model';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';
import { SocketService } from '../../../services/socket.service';

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
  ) {}

  @Output() showTempIngredientsOverlay: EventEmitter<void> =
    new EventEmitter<void>();

  notification: Notification = { type: 'info', message: '', source: 'task' };

  handleMultiImagesUploaded(images: File[]): void {
    this.notification.message = '';
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
    let cvTaskCurrentCount = 0;
    let cvTaskTotalCount = 0;
    this.socketService.fromSocketEvent<any>('cvTaskProgress').subscribe({
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
        if (data?.taskTotalCount) {
          cvTaskTotalCount = data.taskTotalCount;
        }

        if (data?.taskCurrentCount) {
          cvTaskCurrentCount = data.taskCurrentCount;
        } else if (cvTaskCurrentCount !== 0 && cvTaskTotalCount !== 0) {
          cvTaskCurrentCount += 1; // increment by 1 for cv start
        }

        this.notification.taskCurrentCount = cvTaskCurrentCount;
        this.notification.taskTotalCount = cvTaskTotalCount;
        console.log(
          `Received CV Task Progress with type: ${this.notification.type} and message: ${this.notification.message}`,
        );
        if (data?.finished && data.type === 'success') {
          this.showTempIngredientsOverlay.emit();
          this.notification.taskCurrentCount = 1;
          this.notification.taskTotalCount = 1;
          cvTaskCurrentCount = 0;
          cvTaskTotalCount = 0;
        }
      },
      error: (err) => {
        console.error('Error receiving CV Task Progress:', err);
      },
    });
    this.addMultiIngredientsService.finishBatchAdding$.subscribe(() => {
      this.notification = {
        type: 'info',
        message: '',
        source: 'task',
      };
    });
  }
}
