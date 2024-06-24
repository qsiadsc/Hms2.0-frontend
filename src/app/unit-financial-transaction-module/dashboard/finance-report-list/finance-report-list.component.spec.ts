import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceReportListComponent } from './finance-report-list.component';

describe('FinanceReportListComponent', () => {
  let component: FinanceReportListComponent;
  let fixture: ComponentFixture<FinanceReportListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceReportListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
