import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientInputPageComponent } from './ingredient-input-page.component';

describe('IngredientInputPageComponent', () => {
  let component: IngredientInputPageComponent;
  let fixture: ComponentFixture<IngredientInputPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientInputPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientInputPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
