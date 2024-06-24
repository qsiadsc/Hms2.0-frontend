import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UftContinutyComponent } from './uft-continuty.component';

describe('UftContinutyComponent', () => {
  let component: UftContinutyComponent;
  let fixture: ComponentFixture<UftContinutyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UftContinutyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UftContinutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
