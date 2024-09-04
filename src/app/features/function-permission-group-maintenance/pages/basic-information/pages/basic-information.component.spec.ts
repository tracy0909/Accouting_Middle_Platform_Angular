import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInformationComponent } from './basic-information.component';

describe('BasicInformationComponent', () => {
  let component: BasicInformationComponent;
  let fixture: ComponentFixture<BasicInformationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BasicInformationComponent]
    });
    fixture = TestBed.createComponent(BasicInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
