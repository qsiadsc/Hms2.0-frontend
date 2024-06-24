import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalApprovalComponent } from './global-approval.component';

describe('GlobalApprovalComponent', () => {
  let component: GlobalApprovalComponent;
  let fixture: ComponentFixture<GlobalApprovalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalApprovalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
