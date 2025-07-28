import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AddMultiIngredientsService } from '../../../services/add-multi-ingredients.service';

@Component({
  selector: 'app-overlay-model',
  standalone: false,
  templateUrl: './overlay-model.component.html',
  styleUrls: ['./overlay-model.component.scss']
})
export class OverlayModelComponent {
@Output() close = new EventEmitter<void>();
@Input() mode: 'temp-ingredient-list' | 'recipe-generated' | null = null;

  constructor(private addMultiIngredientsService: AddMultiIngredientsService) {
  }

  handleFinishAdding(): void {
    this.close.emit();
    this.mode = null;
    this.addMultiIngredientsService.notifyFinishBatchAdding();
  }

}
  