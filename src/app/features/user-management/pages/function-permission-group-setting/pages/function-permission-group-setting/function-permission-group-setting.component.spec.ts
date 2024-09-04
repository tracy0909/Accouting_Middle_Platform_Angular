import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionPermissionGroupSettingComponent } from './function-permission-group-setting.component';

describe('FunctionPermissionGroupSettingComponent', () => {
  let component: FunctionPermissionGroupSettingComponent;
  let fixture: ComponentFixture<FunctionPermissionGroupSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionPermissionGroupSettingComponent]
    });
    fixture = TestBed.createComponent(FunctionPermissionGroupSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
