import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyTravelInsuranceComponent } from './company-travel-insurance.component';

describe('CompanyTravelInsuranceComponent', () => {
  let component: CompanyTravelInsuranceComponent;
  let fixture: ComponentFixture<CompanyTravelInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyTravelInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyTravelInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
