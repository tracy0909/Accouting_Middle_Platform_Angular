import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteQueryComponent } from './quote-query.component';

describe('QuoteQueryComponent', () => {
  let component: QuoteQueryComponent;
  let fixture: ComponentFixture<QuoteQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuoteQueryComponent]
    });
    fixture = TestBed.createComponent(QuoteQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
