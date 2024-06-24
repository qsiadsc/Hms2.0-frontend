import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderGeneralInformationComponent } from './card-holder-general-information.component';

describe('CardHolderGeneralInformationComponent', () => {
  let component: CardHolderGeneralInformationComponent;
  let fixture: ComponentFixture<CardHolderGeneralInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderGeneralInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderGeneralInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});