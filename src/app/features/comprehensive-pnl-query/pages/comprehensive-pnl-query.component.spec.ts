import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprehensivePnlQueryComponent } from './comprehensive-pnl-query.component';

describe('ComprehensivePnlQueryComponent', () => {
  let component: ComprehensivePnlQueryComponent;
  let fixture: ComponentFixture<ComprehensivePnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComprehensivePnlQueryComponent]
    });
    fixture = TestBed.createComponent(ComprehensivePnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
