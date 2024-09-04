import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginHistQueryComponent } from './login-hist-query.component';

describe('LoginHistQueryComponent', () => {
  let component: LoginHistQueryComponent;
  let fixture: ComponentFixture<LoginHistQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginHistQueryComponent]
    });
    fixture = TestBed.createComponent(LoginHistQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
