import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceivableAdjustmentsComponent } from './receivable-adjustments.component';

describe('ReceivableAdjustmentsComponent', () => {
  let component: ReceivableAdjustmentsComponent;
  let fixture: ComponentFixture<ReceivableAdjustmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivableAdjustmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivableAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
