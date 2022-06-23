import { TestBed } from '@angular/core/testing';

import { UplaodGuard } from './uplaod.guard';

describe('UplaodGuard', () => {
  let guard: UplaodGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UplaodGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
