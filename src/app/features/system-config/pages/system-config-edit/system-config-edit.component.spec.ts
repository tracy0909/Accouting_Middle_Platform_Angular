import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConfigEditComponent } from './system-config-edit.component';

describe('SystemConfigEditComponent', () => {
  let component: SystemConfigEditComponent;
  let fixture: ComponentFixture<SystemConfigEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SystemConfigEditComponent]
    });
    fixture = TestBed.createComponent(SystemConfigEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
