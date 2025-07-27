import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-overlay-model',
  standalone: false,
  templateUrl: './overlay-model.component.html',
  styleUrls: ['./overlay-model.component.scss']
})
export class OverlayModelComponent {
@Output() close = new EventEmitter<void>();
@Input() mode: 'temp-ingredient-list' | 'recipe-generated' | null = null;
}
  