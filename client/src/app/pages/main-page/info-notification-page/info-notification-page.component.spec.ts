import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoNotificationPageComponent } from './info-notification-page.component';

describe('InfoNotificationPageComponent', () => {
  let component: InfoNotificationPageComponent;
  let fixture: ComponentFixture<InfoNotificationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoNotificationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoNotificationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
