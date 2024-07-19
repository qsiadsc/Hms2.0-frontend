import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyAkiraBenefitComponent } from './company-akira-benefit.component';

describe('CompanyAkiraBenefitComponent', () => {
  let component: CompanyAkiraBenefitComponent;
  let fixture: ComponentFixture<CompanyAkiraBenefitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyAkiraBenefitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyAkiraBenefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
