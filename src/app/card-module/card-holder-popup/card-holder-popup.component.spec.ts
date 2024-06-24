import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderPopupComponent } from './card-holder-popup.component';

describe('CardHolderPopupComponent', () => {
  let component: CardHolderPopupComponent;
  let fixture: ComponentFixture<CardHolderPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});