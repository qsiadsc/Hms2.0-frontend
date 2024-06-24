import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyTabDatatableComponent } from './company-tab-datatable.component';

describe('CompanyTabDatatableComponent', () => {
  let component: CompanyTabDatatableComponent;
  let fixture: ComponentFixture<CompanyTabDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyTabDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyTabDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
