import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FridgeSelectorComponent } from './fridge-selector.component';

describe('FridgeSelectorComponent', () => {
  let component: FridgeSelectorComponent;
  let fixture: ComponentFixture<FridgeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FridgeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FridgeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
