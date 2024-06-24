import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderHistoryPopupComponent } from './card-holder-history-popup.component';

describe('CardHolderHistoryPopupComponent', () => {
  let component: CardHolderHistoryPopupComponent;
  let fixture: ComponentFixture<CardHolderHistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderHistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});