import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipePageComponent } from './recipe-page.component';

describe('RecipePageComponent', () => {
  let component: RecipePageComponent;
  let fixture: ComponentFixture<RecipePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
