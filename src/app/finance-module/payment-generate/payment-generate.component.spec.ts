import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentGenerateComponent } from './payment-generate.component';

describe('PaymentGenerateComponent', () => {
  let component: PaymentGenerateComponent;
  let fixture: ComponentFixture<PaymentGenerateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentGenerateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentGenerateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
