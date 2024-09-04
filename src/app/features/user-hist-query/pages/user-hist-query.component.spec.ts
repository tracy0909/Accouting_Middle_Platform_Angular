import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHistQueryComponent } from './user-hist-query.component';

describe('UserHistQueryComponent', () => {
  let component: UserHistQueryComponent;
  let fixture: ComponentFixture<UserHistQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserHistQueryComponent]
    });
    fixture = TestBed.createComponent(UserHistQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
