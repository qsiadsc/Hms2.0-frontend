import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDataManagementReportListComponent } from './app-data-management-report-list.component';

describe('AppDataManagementReportListComponent', () => {
  let component: AppDataManagementReportListComponent;
  let fixture: ComponentFixture<AppDataManagementReportListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppDataManagementReportListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppDataManagementReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
