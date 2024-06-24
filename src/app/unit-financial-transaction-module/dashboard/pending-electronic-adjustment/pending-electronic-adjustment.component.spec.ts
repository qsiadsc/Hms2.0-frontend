import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingElectronicAdjustmentComponent } from './pending-electronic-adjustment.component';

describe('PendingElectronicAdjustmentComponent', () => {
  let component: PendingElectronicAdjustmentComponent;
  let fixture: ComponentFixture<PendingElectronicAdjustmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingElectronicAdjustmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingElectronicAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
