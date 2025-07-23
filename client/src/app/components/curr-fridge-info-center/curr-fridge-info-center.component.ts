import { Component } from '@angular/core';
import { FridgeService } from '../../services/fridge.service';
import { Observable } from 'rxjs';
import { Fridge } from '../../models/fridge.model';

@Component({
  selector: 'app-curr-fridge-info-center',
  standalone: false,
  templateUrl: './curr-fridge-info-center.component.html',
  styleUrl: './curr-fridge-info-center.component.scss'
})
export class CurrFridgeInfoCenterComponent {
  currFridgeInfo: Fridge | null = null;
  constructor(private fridgeService: FridgeService) {}

  ngOnInit(): void {
    this.fridgeService.currentFridge$.subscribe((fridge) => {
      this.currFridgeInfo = fridge;
    });
  }

}
