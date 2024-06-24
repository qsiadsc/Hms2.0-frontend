import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UftContinutyComponentCallin } from './uft-continuty-call-in.component';

describe('UftContinutyComponentCallin', () => {
  let component: UftContinutyComponentCallin;
  let fixture: ComponentFixture<UftContinutyComponentCallin>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UftContinutyComponentCallin ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UftContinutyComponentCallin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
