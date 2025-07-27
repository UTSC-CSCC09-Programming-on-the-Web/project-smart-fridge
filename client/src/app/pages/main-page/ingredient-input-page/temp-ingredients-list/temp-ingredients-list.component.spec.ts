import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempIngredientsListComponent } from './temp-ingredients-list.component';

describe('TempIngredientsListComponent', () => {
  let component: TempIngredientsListComponent;
  let fixture: ComponentFixture<TempIngredientsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempIngredientsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TempIngredientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
