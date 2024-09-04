import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LendUnrealdnMarketvalueComponent } from './lend-unrealdn-marketvalue.component';

describe('LendUnrealdnMarketvalueComponent', () => {
  let component: LendUnrealdnMarketvalueComponent;
  let fixture: ComponentFixture<LendUnrealdnMarketvalueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LendUnrealdnMarketvalueComponent]
    });
    fixture = TestBed.createComponent(LendUnrealdnMarketvalueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
