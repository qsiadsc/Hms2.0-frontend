import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceReportsComponent } from './finance-reports.component';

describe('FinanceReportsComponent', () => {
  let component: FinanceReportsComponent;
  let fixture: ComponentFixture<FinanceReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
