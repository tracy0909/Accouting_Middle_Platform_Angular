import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionSettingEditComponent } from './function-setting-edit.component';

describe('FunctionSettingEditComponent', () => {
  let component: FunctionSettingEditComponent;
  let fixture: ComponentFixture<FunctionSettingEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionSettingEditComponent]
    });
    fixture = TestBed.createComponent(FunctionSettingEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
