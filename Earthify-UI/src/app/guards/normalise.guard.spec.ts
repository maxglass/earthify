import { TestBed } from '@angular/core/testing';

import { NormaliseGuard } from './normalise.guard';

describe('NormaliseGuard', () => {
  let guard: NormaliseGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NormaliseGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
