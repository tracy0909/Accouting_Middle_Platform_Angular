import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchStatusQueryComponent } from './branch-status-query.component';

describe('BranchStatusQueryComponent', () => {
  let component: BranchStatusQueryComponent;
  let fixture: ComponentFixture<BranchStatusQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BranchStatusQueryComponent]
    });
    fixture = TestBed.createComponent(BranchStatusQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
