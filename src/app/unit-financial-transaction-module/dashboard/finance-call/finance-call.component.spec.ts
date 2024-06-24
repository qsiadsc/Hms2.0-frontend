import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceCallComponent } from './finance-call.component';

describe('FinanceCallComponent', () => {
  let component: FinanceCallComponent;
  let fixture: ComponentFixture<FinanceCallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceCallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
