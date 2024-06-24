import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySearchFilterComponent } from './company-search-filter.component';

describe('CompanySearchFilterComponent', () => {
  let component: CompanySearchFilterComponent;
  let fixture: ComponentFixture<CompanySearchFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanySearchFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanySearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
