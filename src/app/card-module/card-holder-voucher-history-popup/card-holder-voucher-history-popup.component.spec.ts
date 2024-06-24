import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderVoucherHistoryPopupComponent } from './card-holder-voucher-history-popup.component';

describe('CardHolderVoucherHistoryPopupComponent', () => {
  let component: CardHolderVoucherHistoryPopupComponent;
  let fixture: ComponentFixture<CardHolderVoucherHistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderVoucherHistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderVoucherHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});