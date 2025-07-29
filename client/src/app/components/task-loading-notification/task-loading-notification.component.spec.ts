import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskLoadingNotificationComponent } from './task-loading-notification.component';

describe('TaskLoadingNotificationComponent', () => {
  let component: TaskLoadingNotificationComponent;
  let fixture: ComponentFixture<TaskLoadingNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskLoadingNotificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskLoadingNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
