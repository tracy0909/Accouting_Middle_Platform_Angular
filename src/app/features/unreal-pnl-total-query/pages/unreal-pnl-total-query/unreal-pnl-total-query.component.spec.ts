import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnrealPnlTotalQueryComponent } from './unreal-pnl-total-query.component';

describe('UnrealPnlTotalQueryComponent', () => {
  let component: UnrealPnlTotalQueryComponent;
  let fixture: ComponentFixture<UnrealPnlTotalQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnrealPnlTotalQueryComponent]
    });
    fixture = TestBed.createComponent(UnrealPnlTotalQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
