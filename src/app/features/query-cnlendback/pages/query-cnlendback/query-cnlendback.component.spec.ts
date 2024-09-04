import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryCnlendbackComponent } from './query-cnlendback.component';

describe('QueryCnlendbackComponent', () => {
  let component: QueryCnlendbackComponent;
  let fixture: ComponentFixture<QueryCnlendbackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QueryCnlendbackComponent]
    });
    fixture = TestBed.createComponent(QueryCnlendbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
