import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceReportCallInComponent } from './finance-report-call-in.component';

describe('FinanceReportCallInComponent', () => {
  let component: FinanceReportCallInComponent;
  let fixture: ComponentFixture<FinanceReportCallInComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceReportCallInComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceReportCallInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
