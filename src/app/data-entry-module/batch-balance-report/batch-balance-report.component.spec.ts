import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchBalanceReportComponent } from './batch-balance-report.component';

describe('BatchBalanceReportComponent', () => {
  let component: BatchBalanceReportComponent;
  let fixture: ComponentFixture<BatchBalanceReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchBalanceReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchBalanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
