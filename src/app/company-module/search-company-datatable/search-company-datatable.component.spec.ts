import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCompanyDatatableComponent } from './search-company-datatable.component';

describe('SearchCompanyDatatableComponent', () => {
  let component: SearchCompanyDatatableComponent;
  let fixture: ComponentFixture<SearchCompanyDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchCompanyDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCompanyDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
