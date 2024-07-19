import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyEfapBenefitComponent } from './company-efap-benefit.component';

describe('CompanyEfapBenefitComponent', () => {
  let component: CompanyEfapBenefitComponent;
  let fixture: ComponentFixture<CompanyEfapBenefitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyEfapBenefitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyEfapBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
