import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFridgeFormComponent } from './new-fridge-form.component';

describe('NewFridgeFormComponent', () => {
  let component: NewFridgeFormComponent;
  let fixture: ComponentFixture<NewFridgeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFridgeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewFridgeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
