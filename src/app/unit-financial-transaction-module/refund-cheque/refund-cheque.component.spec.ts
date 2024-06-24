import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RefundChequeComponent } from './refund-cheque.component';

describe('RefundChequeComponent', () => {
  let component: RefundChequeComponent;
  let fixture: ComponentFixture<RefundChequeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RefundChequeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
