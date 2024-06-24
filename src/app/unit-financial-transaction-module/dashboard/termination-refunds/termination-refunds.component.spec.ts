import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TerminationRefundsComponent } from './termination-refunds.component';

describe('TerminationRefundsComponent', () => {
  let component: TerminationRefundsComponent;
  let fixture: ComponentFixture<TerminationRefundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminationRefundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminationRefundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
