import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Fridge } from '../../models/fridge.model';
import { FridgeService } from '../../services/fridge.service';

@Component({
  selector: 'app-fridge-selector',
  standalone: false,
  templateUrl: './fridge-selector.component.html',
  styleUrl: './fridge-selector.component.scss',
})
export class FridgeSelectorComponent {
  fridges: Fridge[] = [];
  currentFridge: Fridge | null = null;

  constructor(private fridgeService: FridgeService) {}

  ngOnInit(): void {
    this.fridgeService.getUserFridges().subscribe((res) => {
      this.fridges = res?.fridges || [];
      if (this.fridges.length > 0) {
        this.currentFridge = this.fridges[0];
      }
    });
    this.fridgeService.fridgesList$.subscribe((fridges) => {
      this.fridges = fridges;
    });
    this.fridgeService.currentFridge$.subscribe((fridge) => {
      this.currentFridge = fridge || null;
    });
  }

  onFridgeSelect(fridge: Fridge): void {
    this.fridgeService.setCurrentFridge(fridge);
  }
}
