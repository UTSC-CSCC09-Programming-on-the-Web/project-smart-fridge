import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiImageUploadComponent } from './multi-image-upload.component';

describe('MultiImageUploadComponent', () => {
  let component: MultiImageUploadComponent;
  let fixture: ComponentFixture<MultiImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiImageUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
