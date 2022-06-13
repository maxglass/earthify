import { TestBed } from '@angular/core/testing';

import { LoginAdminGuard } from './login-admin.guard';

describe('LoginAdminGuard', () => {
  let guard: LoginAdminGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LoginAdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
