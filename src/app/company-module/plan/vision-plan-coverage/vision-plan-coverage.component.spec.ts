import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionPlanCoverageComponent } from './vision-plan-coverage.component';

describe('VisionPlanCoverageComponent', () => {
  let component: VisionPlanCoverageComponent;
  let fixture: ComponentFixture<VisionPlanCoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisionPlanCoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisionPlanCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
