import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardBankAccComponent } from './card-bank-acc.component';

describe('CardBankAccComponent', () => {
  let component: CardBankAccComponent;
  let fixture: ComponentFixture<CardBankAccComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardBankAccComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardBankAccComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});