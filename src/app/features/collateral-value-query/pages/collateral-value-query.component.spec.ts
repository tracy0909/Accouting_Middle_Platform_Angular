import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollateralValueQueryComponent } from './collateral-value-query.component';

describe('CollateralValueQueryComponent', () => {
  let component: CollateralValueQueryComponent;
  let fixture: ComponentFixture<CollateralValueQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CollateralValueQueryComponent]
    });
    fixture = TestBed.createComponent(CollateralValueQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
