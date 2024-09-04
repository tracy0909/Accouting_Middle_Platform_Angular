import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureListManagementDialogComponent } from './feature-list-management-dialog.component';

describe('FeatureListManagementDialogComponent', () => {
  let component: FeatureListManagementDialogComponent;
  let fixture: ComponentFixture<FeatureListManagementDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureListManagementDialogComponent]
    });
    fixture = TestBed.createComponent(FeatureListManagementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
