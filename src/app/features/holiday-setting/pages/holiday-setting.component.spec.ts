import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaySettingComponent } from './holiday-setting.component';

describe('HolidaySettingComponent', () => {
  let component: HolidaySettingComponent;
  let fixture: ComponentFixture<HolidaySettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HolidaySettingComponent]
    });
    fixture = TestBed.createComponent(HolidaySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
