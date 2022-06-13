import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GLoginComponent } from './g-login.component';

describe('GLoginComponent', () => {
  let component: GLoginComponent;
  let fixture: ComponentFixture<GLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
