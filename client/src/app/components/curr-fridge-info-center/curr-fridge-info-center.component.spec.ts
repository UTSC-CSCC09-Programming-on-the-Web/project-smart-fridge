import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrFridgeInfoCenterComponent } from './curr-fridge-info-center.component';

describe('CurrFridgeInfoCenterComponent', () => {
  let component: CurrFridgeInfoCenterComponent;
  let fixture: ComponentFixture<CurrFridgeInfoCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrFridgeInfoCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrFridgeInfoCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
