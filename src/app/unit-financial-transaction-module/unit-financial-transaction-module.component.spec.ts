import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitFinancialTransactionModuleComponent } from './unit-financial-transaction-module.component';

describe('UnitFinancialTransactionModuleComponent', () => {
  let component: UnitFinancialTransactionModuleComponent;
  let fixture: ComponentFixture<UnitFinancialTransactionModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitFinancialTransactionModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitFinancialTransactionModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
