import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CompCardHolderContinutyComponent } from './comp-card-holder-continuty.component';

describe('CompCardHolderContinutyComponent', () => {
  let component: CompCardHolderContinutyComponent;
  let fixture: ComponentFixture<CompCardHolderContinutyComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompCardHolderContinutyComponent ]
    })
    .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(CompCardHolderContinutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
