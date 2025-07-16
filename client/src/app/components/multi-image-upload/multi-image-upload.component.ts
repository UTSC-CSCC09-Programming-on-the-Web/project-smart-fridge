import { Component, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {validateImageFile, readImageAsDataUrl} from '../../utils/image.util';

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

  @Output() multiImagesUploaded = new EventEmitter<File[]>();

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
  }
  clearAllImages(): void {
    this.selectedImages = [];
    this.imagePreviews = [];
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  uploadImages(){
    if (this.selectedImages.length === 0) {
      alert('No images selected for upload.');
      return;
    }
    this.multiImagesUploaded.emit(this.selectedImages);
    console.log('Uploading images:', this.selectedImages);
  }
}  
