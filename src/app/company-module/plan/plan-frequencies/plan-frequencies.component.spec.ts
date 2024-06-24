import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanFrequenciesComponent } from './plan-frequencies.component';

describe('PlanFrequenciesComponent', () => {
  let component: PlanFrequenciesComponent;
  let fixture: ComponentFixture<PlanFrequenciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanFrequenciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanFrequenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
