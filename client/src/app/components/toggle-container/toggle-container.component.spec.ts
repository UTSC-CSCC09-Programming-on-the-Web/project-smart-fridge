import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleContainerComponent } from './toggle-container.component';

describe('ToggleContainerComponent', () => {
  let component: ToggleContainerComponent;
  let fixture: ComponentFixture<ToggleContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
