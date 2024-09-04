import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreMarketCheckComponent } from './pre-market-check.component';

describe('PreMarketCheckComponent', () => {
  let component: PreMarketCheckComponent;
  let fixture: ComponentFixture<PreMarketCheckComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreMarketCheckComponent]
    });
    fixture = TestBed.createComponent(PreMarketCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
