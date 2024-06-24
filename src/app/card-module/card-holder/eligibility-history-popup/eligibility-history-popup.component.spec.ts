import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EligibilityHistoryPopupComponent } from './eligibility-history-popup.component';

describe('EligibilityHistoryPopupComponent', () => {
  let component: EligibilityHistoryPopupComponent;
  let fixture: ComponentFixture<EligibilityHistoryPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EligibilityHistoryPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityHistoryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});