import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubResultQueryComponent } from './sub-result-query.component';

describe('SubResultQueryComponent', () => {
  let component: SubResultQueryComponent;
  let fixture: ComponentFixture<SubResultQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubResultQueryComponent]
    });
    fixture = TestBed.createComponent(SubResultQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
