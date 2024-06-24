import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BankReconcilationComponent } from './bank-reconcilation.component';

describe('BankReconcilationComponent', () => {
  let component: BankReconcilationComponent;
  let fixture: ComponentFixture<BankReconcilationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankReconcilationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankReconcilationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
