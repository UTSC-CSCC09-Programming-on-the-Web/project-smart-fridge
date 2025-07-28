import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { validateImageFile, readImageAsDataUrl } from '../../utils/image.util';
import { AddMultiIngredientsService } from '../../services/add-multi-ingredients.service';

@Component({
  selector: 'app-multi-image-upload',
  templateUrl: './multi-image-upload.component.html',
  styleUrl: './multi-image-upload.component.scss',
  standalone: false,
})
export class MultiImageUploadComponent {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  maxCount: number = 5; // Maximum number of images allowed

  @Output() multiImagesUploaded = new EventEmitter<File[]>();

  constructor(private addMultiIngredientsService: AddMultiIngredientsService) {}

  ngOnInit(): void {
    this.addMultiIngredientsService.finishBatchAdding$.subscribe(() => {
      this.clearAllImages();
    });
  }

  onFilesSelected(event: Event): void {
    if (!this.fileInput || !this.fileInput.nativeElement) {
      console.warn('File input is not available.');
      return;
    }
    const input = this.fileInput.nativeElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      for (const file of files) {
        const errorMessage = validateImageFile(file);
        if (errorMessage) {
          alert(errorMessage);
          continue;
        }
        if (this.selectedImages.length >= this.maxCount) {
          alert(`You can only upload a maximum of ${this.maxCount} images.`);
          return;
        }
        this.selectedImages.push(file);
        readImageAsDataUrl(file)
          .then((dataUrl) => {
            this.imagePreviews.push(dataUrl);
          })
          .catch((error) => {
            console.error('Error reading image file:', error);
            alert('Failed to read image file.');
          });
      }
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    if (index === this.selectedImages.length && this?.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
  clearAllImages(): void {
    this.selectedImages = [];
    this.imagePreviews = [];
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadImages() {
    if (this.selectedImages.length === 0) {
      alert('No images selected for upload.');
      return;
    }
    this.multiImagesUploaded.emit(this.selectedImages);
    console.log('Uploading images:', this.selectedImages);
  }
}
