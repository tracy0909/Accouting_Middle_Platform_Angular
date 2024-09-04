import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnrealPnlQueryComponent } from './unreal-pnl-query.component';

describe('UnrealPnlQueryComponent', () => {
  let component: UnrealPnlQueryComponent;
  let fixture: ComponentFixture<UnrealPnlQueryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnrealPnlQueryComponent]
    });
    fixture = TestBed.createComponent(UnrealPnlQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
