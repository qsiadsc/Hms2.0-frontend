import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrokerPaymentsComponent } from './broker-payments.component';

describe('BrokerPaymentsComponent', () => {
  let component: BrokerPaymentsComponent;
  let fixture: ComponentFixture<BrokerPaymentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokerPaymentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokerPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
