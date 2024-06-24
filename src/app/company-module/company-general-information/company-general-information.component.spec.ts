import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyGeneralInformationComponent } from './company-general-information.component';

describe('CompanyGeneralInformationComponent', () => {
  let component: CompanyGeneralInformationComponent;
  let fixture: ComponentFixture<CompanyGeneralInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyGeneralInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
