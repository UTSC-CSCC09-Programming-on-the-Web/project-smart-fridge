import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FridgeService } from '../../../services/fridge.service';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';

@Component({
  selector: 'app-addi-feature-page',
  standalone: false,
  templateUrl: './addi-feature-page.component.html',
  styleUrl: './addi-feature-page.component.scss',
})
export class AddiFeaturePageComponent {
  showTempIngredientsBtn: boolean = false;
  @Output() showOverlay: EventEmitter<void> = new EventEmitter<void>();
  @Output() overlayMode: EventEmitter<
    'temp-ingredient-list' | 'recipe-generated' | null
  > = new EventEmitter<'temp-ingredient-list' | 'recipe-generated' | null>();
  constructor(
    private authService: AuthService,
    private fridgeService: FridgeService,
    private addMultiIngredientsService: AddMultiIngredientsService,
  ) {}

  ngOnInit(): void {
    this.addMultiIngredientsService.finishBatchAdding$.subscribe(() => {
      console.log('Batch adding finished');
      this.showTempIngredientsBtn = false;
    });
  }

  onSubmitNewFridgeForm(): void {
    this.fridgeService.getUserFridges().subscribe({
      next: () => {
        console.log('New fridge added successfully');
      },
      error: (err) => {
        console.error('Error adding new fridge:', err);
      },
    });
    this.authService.getCurrentUser().subscribe({
      next: () => {
        console.log('User data refreshed after adding new fridge');
      },
      error: (err) => {
        console.error('Error refreshing user data:', err);
      },
    });
  }

  handleShowTempIngredientsBtn(): void {
    this.showTempIngredientsBtn = true;
  }

  onShowTempIngredientsOverlay(): void {
    console.log(
      'Showing temporary ingredients overlay from AddiFeaturePageComponent',
    );
    this.overlayMode.emit('temp-ingredient-list');
    this.showOverlay.emit();
  }
}
