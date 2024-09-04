import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionSettingsComponent } from './function-settings.component';

describe('FunctionSettingsComponent', () => {
  let component: FunctionSettingsComponent;
  let fixture: ComponentFixture<FunctionSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionSettingsComponent]
    });
    fixture = TestBed.createComponent(FunctionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
