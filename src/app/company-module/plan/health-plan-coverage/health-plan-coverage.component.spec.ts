import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthPlanCoverageComponent } from './health-plan-coverage.component';

describe('HealthPlanCoverageComponent', () => {
  let component: HealthPlanCoverageComponent;
  let fixture: ComponentFixture<HealthPlanCoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthPlanCoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthPlanCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
