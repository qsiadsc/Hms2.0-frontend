import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataManagementDashboardModuleComponent } from './data-management-dashboard-module.component';

describe('DataManagementDashboardModuleComponent', () => {
  let component: DataManagementDashboardModuleComponent;
  let fixture: ComponentFixture<DataManagementDashboardModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataManagementDashboardModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataManagementDashboardModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
