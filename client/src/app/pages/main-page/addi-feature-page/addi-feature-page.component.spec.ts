import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddiFeaturePageComponent } from './addi-feature-page.component';

describe('AddiFeaturePageComponent', () => {
  let component: AddiFeaturePageComponent;
  let fixture: ComponentFixture<AddiFeaturePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddiFeaturePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddiFeaturePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
