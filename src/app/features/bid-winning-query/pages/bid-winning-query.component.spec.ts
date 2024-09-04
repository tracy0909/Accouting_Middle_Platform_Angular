import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidWinningQueryComponent } from './bid-winning-query.component';

describe('BidWinningQueryComponent', () => {
  let component: BidWinningQueryComponent;
  let fixture: ComponentFixture<BidWinningQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BidWinningQueryComponent]
    });
    fixture = TestBed.createComponent(BidWinningQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
