import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderCobhistoryPopupComponent } from './card-holder-cobhistory-popup.component';

describe('CardHolderCobhistoryPopupComponent', () => {
  let component: CardHolderCobhistoryPopupComponent;
  let fixture: ComponentFixture<CardHolderCobhistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderCobhistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderCobhistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});