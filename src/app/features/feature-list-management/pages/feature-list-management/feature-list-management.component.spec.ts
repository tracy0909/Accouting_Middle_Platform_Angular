import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureListManagementComponent } from './feature-list-management.component';

describe('FeatureListManagementComponent', () => {
  let component: FeatureListManagementComponent;
  let fixture: ComponentFixture<FeatureListManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureListManagementComponent]
    });
    fixture = TestBed.createComponent(FeatureListManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
