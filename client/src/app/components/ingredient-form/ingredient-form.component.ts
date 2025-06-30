// ingredient-form.component.ts

import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';

@Component({
  selector: 'app-ingredient-form',
  templateUrl: './ingredient-form.component.html',
  styleUrls: ['./ingredient-form.component.scss'],
    standalone: false
})

export class IngredientFormComponent {
  ingredientForm: FormGroup;

  @Output() submitIngredient = new EventEmitter<Partial<Ingredient>>();

  constructor(private fb: FormBuilder) {
    this.ingredientForm = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      unit: ['pcs', Validators.required],
      expire_date: ['', Validators.required],
      type: [''],
      image_url: [''] // placeholder
    });
  }

  ngOnInit(): void {}

  postNewIngredient(): void {
    if (this.ingredientForm.valid) {
      this.submitIngredient.emit(this.ingredientForm.value);
      this.ingredientForm.reset();
    }else {
      console.error('Form is invalid');
    }
  }
}