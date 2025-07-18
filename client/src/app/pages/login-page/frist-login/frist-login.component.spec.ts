import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FristLoginComponent } from './frist-login.component';

describe('FristLoginComponent', () => {
  let component: FristLoginComponent;
  let fixture: ComponentFixture<FristLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FristLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FristLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
