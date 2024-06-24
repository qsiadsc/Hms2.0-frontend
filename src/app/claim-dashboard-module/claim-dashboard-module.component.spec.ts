import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimDashboardModuleComponent } from './claim-dashboard-module.component';

describe('ClaimDashboardModuleComponent', () => {
  let component: ClaimDashboardModuleComponent;
  let fixture: ComponentFixture<ClaimDashboardModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimDashboardModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDashboardModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
