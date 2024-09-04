import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInformationEditComponent } from './basic-information-edit.component';

describe('BasicInformationEditComponent', () => {
  let component: BasicInformationEditComponent;
  let fixture: ComponentFixture<BasicInformationEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BasicInformationEditComponent]
    });
    fixture = TestBed.createComponent(BasicInformationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
