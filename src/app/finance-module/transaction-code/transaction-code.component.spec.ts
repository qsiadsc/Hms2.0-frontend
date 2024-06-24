import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionCodeComponent } from './transaction-code.component';

describe('TransactionCodeComponent', () => {
  let component: TransactionCodeComponent;
  let fixture: ComponentFixture<TransactionCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
