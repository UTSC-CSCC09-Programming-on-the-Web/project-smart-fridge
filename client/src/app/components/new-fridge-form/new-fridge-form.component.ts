import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FridgeService } from '../../services/fridge.service';

@Component({
  selector: 'app-new-fridge-form',
  standalone: false,
  templateUrl: './new-fridge-form.component.html',
  styleUrl: './new-fridge-form.component.scss',
})
export class NewFridgeFormComponent {
  createForm: FormGroup;
  joinForm: FormGroup;
  currentForm: 'create' | 'join' = 'create';

  message = '';
  loading = false;

  @Output() submitForm = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private fridgeService: FridgeService,
    private router: Router,
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    this.joinForm = this.fb.group({
      fridge_id: ['', Validators.required],
    });
  }

  switchForm(type: 'create' | 'join') {
    this.currentForm = type;
    this.message = '';
  }

  onSubmit() {
    this.loading = true;
    this.message = '';

    if (this.currentForm === 'create' && this.createForm.valid) {
      const { name, description } = this.createForm.value;
      this.fridgeService.createFridge(name, description).subscribe(
        (res) => {
          this.loading = false;
          this.message = res.message || 'Fridge created successfully!';
          if (res?.success) {
            this.submitForm.emit();
          }
        },
        (err) => {
          this.loading = false;
          this.message = err.error?.message || 'Failed to create fridge.';
          console.error('Error creating fridge:', err);
        },
      );
    }

    if (this.currentForm === 'join' && this.joinForm.valid) {
      const { fridge_id } = this.joinForm.value;
      this.fridgeService.joinFridge(fridge_id).subscribe((res) => {
        this.loading = false;
        this.message = res.message || 'Joined fridge successfully!';
        if (res?.success) {
          this.submitForm.emit();
        }
      });
    }
  }
}
