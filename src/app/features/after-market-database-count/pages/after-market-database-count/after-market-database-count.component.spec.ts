import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterMarketDatabaseCountComponent } from './after-market-database-count.component';

describe('AfterMarketDatabaseCountComponent', () => {
  let component: AfterMarketDatabaseCountComponent;
  let fixture: ComponentFixture<AfterMarketDatabaseCountComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AfterMarketDatabaseCountComponent]
    });
    fixture = TestBed.createComponent(AfterMarketDatabaseCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
