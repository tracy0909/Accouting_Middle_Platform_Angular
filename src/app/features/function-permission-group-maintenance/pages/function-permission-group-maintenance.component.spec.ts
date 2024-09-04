import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionPermissionGroupMaintenanceComponent } from './function-permission-group-maintenance.component';

describe('FunctionPermissionGroupMaintenanceComponent', () => {
  let component: FunctionPermissionGroupMaintenanceComponent;
  let fixture: ComponentFixture<FunctionPermissionGroupMaintenanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionPermissionGroupMaintenanceComponent]
    });
    fixture = TestBed.createComponent(FunctionPermissionGroupMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
