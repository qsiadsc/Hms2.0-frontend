import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderExpenseHistoryPopupComponent } from './card-holder-expense-history-popup.component';

describe('CardHolderExpenseHistoryPopupComponent', () => {
  let component: CardHolderExpenseHistoryPopupComponent;
  let fixture: ComponentFixture<CardHolderExpenseHistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderExpenseHistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderExpenseHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});