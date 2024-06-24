import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyFinancialDataComponent } from './company-financial-data.component';

describe('CompanyFinancialDataComponent', () => {
  let component: CompanyFinancialDataComponent;
  let fixture: ComponentFixture<CompanyFinancialDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyFinancialDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyFinancialDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
