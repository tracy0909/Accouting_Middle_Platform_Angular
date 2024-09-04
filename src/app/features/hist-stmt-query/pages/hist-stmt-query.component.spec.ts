import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistStmtQueryComponent } from './hist-stmt-query.component';

describe('HistStmtQueryComponent', () => {
  let component: HistStmtQueryComponent;
  let fixture: ComponentFixture<HistStmtQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistStmtQueryComponent]
    });
    fixture = TestBed.createComponent(HistStmtQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
