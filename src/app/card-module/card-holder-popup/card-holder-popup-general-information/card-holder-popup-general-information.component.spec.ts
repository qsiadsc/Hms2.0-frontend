import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderPopupGeneralInformationComponent } from './card-holder-popup-general-information.component';

describe('CardHolderPopupGeneralInformationComponent', () => {
  let component: CardHolderPopupGeneralInformationComponent;
  let fixture: ComponentFixture<CardHolderPopupGeneralInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderPopupGeneralInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderPopupGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});