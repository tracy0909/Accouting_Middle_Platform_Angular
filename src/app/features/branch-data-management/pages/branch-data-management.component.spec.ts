import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDataManagementComponent } from './branch-data-management.component';

describe('BranchDataManagementComponent', () => {
  let component: BranchDataManagementComponent;
  let fixture: ComponentFixture<BranchDataManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BranchDataManagementComponent]
    });
    fixture = TestBed.createComponent(BranchDataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
