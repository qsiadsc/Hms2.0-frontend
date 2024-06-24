import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderEligibilityComponent } from './card-holder-eligibility.component';

describe('CardHolderEligibilityComponent', () => {
  let component: CardHolderEligibilityComponent;
  let fixture: ComponentFixture<CardHolderEligibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderEligibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});