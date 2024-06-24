import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardEligibilityComponent } from './card-eligibility.component';

describe('CardEligibilityComponent', () => {
  let component: CardEligibilityComponent;
  let fixture: ComponentFixture<CardEligibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardEligibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});