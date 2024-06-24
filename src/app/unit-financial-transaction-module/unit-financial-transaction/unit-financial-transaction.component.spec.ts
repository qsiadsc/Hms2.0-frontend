import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitFinancialTransactionComponent } from './unit-financial-transaction.component';

describe('UnitFinancialTransactionComponent', () => {
  let component: UnitFinancialTransactionComponent;
  let fixture: ComponentFixture<UnitFinancialTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitFinancialTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitFinancialTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
