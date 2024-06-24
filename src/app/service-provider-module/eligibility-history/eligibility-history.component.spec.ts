import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EligibilityHistoryComponent } from './eligibility-history.component';

describe('EligibilityHistoryComponent', () => {
  let component: EligibilityHistoryComponent;
  let fixture: ComponentFixture<EligibilityHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EligibilityHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
