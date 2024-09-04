import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSettingsPickListComponent } from './user-settings-pick-list.component';

describe('UserSettingsPickListComponent', () => {
  let component: UserSettingsPickListComponent;
  let fixture: ComponentFixture<UserSettingsPickListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserSettingsPickListComponent]
    });
    fixture = TestBed.createComponent(UserSettingsPickListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
