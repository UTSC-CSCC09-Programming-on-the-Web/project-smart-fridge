// ingredient-form.component.ts

import {
  Component,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';

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

  @Output() submitIngredient = new EventEmitter<Partial<Ingredient>>();
  @Output() cancelEdit = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.ingredientForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      unit: ['pcs', Validators.required],
      expire_date: ['', Validators.required],
      type: [''],
      image_url: [''], // placeholder
    });
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
        image_url: this.ingredientToEdit.image_url || '',
      });
      console.log('Form updated for editing:', this.ingredientToEdit);
    }
  }

  ngOnInit(): void {}

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

      this.submitIngredient.emit(output);

      if (this.mode === 'add') {
        this.ingredientForm.reset();
      }
    } else {
      console.error('Form is invalid');
    }
  }
}
