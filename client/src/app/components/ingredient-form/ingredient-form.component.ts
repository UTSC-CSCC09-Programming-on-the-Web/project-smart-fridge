// ingredient-form.component.ts

import {
  Component,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';
import { ingredientToFormData } from '../../utils/form-data.util';
import {validateImageFile, readImageAsDataUrl} from '../../utils/image.util';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.scss'],
  standalone: false,
})
export class IngredientFormComponent {
  ingredientForm: FormGroup;

  @Input() mode: 'add' | 'edit' = 'add';
  @Input() ingredientToEdit?: Ingredient;

  @Output() addIngredient = new EventEmitter<FormData>();
  @Output() submitIngredient = new EventEmitter<Partial<Ingredient>>();
  @Output() cancelEdit = new EventEmitter<void>();

  selectedImage: File | null = null;

  constructor(private fb: FormBuilder) {
    this.ingredientForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      unit: ['pcs', Validators.required],
      expire_date: ['', Validators.required],
      type: [''],
    });
  }

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  imagePreviewUrl: string | null = null;

  onFileSelected(event: Event): void {
    if (!this.fileInput || !this.fileInput.nativeElement) {
      console.warn('File input is not available.');
      return;
    }
    const input = this.fileInput.nativeElement;
    if (input.files && input.files.length > 0) {
      const image = input.files[0];

      const errorMessage = validateImageFile(image);
      if (errorMessage) {
        alert(errorMessage);
        return;
      }

      this.selectedImage = image;
      this.imagePreviewUrl = null; 
      readImageAsDataUrl(image)
        .then((dataUrl) => {
          this.imagePreviewUrl = dataUrl;
        })
        .catch((error) => {
          console.error('Error reading image file:', error);
          alert('Failed to read image file.');
        });
    }
  }

  // This method is called when the component receives new input properties
  // It updates the form values if the mode is 'edit' and ingredientToEdit is provided
  // This is useful for pre-filling the form with existing ingredient data when editing
  ngOnChanges(changes: SimpleChanges): void {
    if (
      this.mode === 'edit' &&
      changes['ingredientToEdit'] &&
      this.ingredientToEdit
    ) {
      this.ingredientForm.patchValue({
        name: this.ingredientToEdit.name,
        quantity: this.ingredientToEdit.quantity,
        unit: this.ingredientToEdit.unit,
        expire_date: this.ingredientToEdit.expire_date,
        type: this.ingredientToEdit.type,
      });
    }
  }

  ngOnInit(): void {}

  clearForm(): void {
    this.ingredientForm.reset();
    this.selectedImage = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.imagePreviewUrl = null;
  }

  postIngredient(): void {
    if (this.ingredientForm.valid) {
      let output: Partial<Ingredient>;

      if (this.mode === 'edit' && this.ingredientToEdit) {
        // If in edit mode, merge the existing ingredient with the form values
        output = {
          ...this.ingredientToEdit,
          ...this.ingredientForm.value,
        };
      } else {
        output = this.ingredientForm.value;
      }

      if (this.mode === 'add') {
        const formData = ingredientToFormData(output, this.selectedImage);
        this.addIngredient.emit(formData);
        this.clearForm();
        return;
      }

      this.submitIngredient.emit(output);
    } else {
      console.error('Form is invalid');
    }
  }
}
