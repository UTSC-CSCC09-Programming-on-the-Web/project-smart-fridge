import { TestBed } from '@angular/core/testing';

import { AddMultiIngredientsService } from './add-multi-ingredients.service';

describe('AddMultiIngredientsService', () => {
  let service: AddMultiIngredientsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddMultiIngredientsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
