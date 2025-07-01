import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientListPageComponent } from './ingredient-list-page.component';

describe('IngredientListPageComponent', () => {
  let component: IngredientListPageComponent;
  let fixture: ComponentFixture<IngredientListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientListPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IngredientListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
