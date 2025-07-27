import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FridgeService } from '../../../services/fridge.service';

@Component({
  selector: 'app-addi-feature-page',
  standalone: false,
  templateUrl: './addi-feature-page.component.html',
  styleUrl: './addi-feature-page.component.scss'
})
export class AddiFeaturePageComponent {
  mode: 'newFridge' | 'fridgeSelector' | 'recipePage' | 'ingredientInputPage' = 'ingredientInputPage';  

  constructor(
    private authService: AuthService,
    private fridgeService: FridgeService,
  ) {}

  addNewFridge(): void {
    this.mode = 'newFridge';
  }

  onSubmitNewFridgeForm(): void {
    this.mode = 'fridgeSelector';
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

  switchFridgeList(): void {
    this.mode = 'fridgeSelector';
  }

  switchRecipePage(): void {
    this.mode = 'recipePage';
  }

  switchIngredientInputPage(): void {
    this.mode = 'ingredientInputPage';
  }

}
