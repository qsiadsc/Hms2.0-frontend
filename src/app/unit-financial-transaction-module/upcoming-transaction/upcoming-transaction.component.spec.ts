import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingTransactionComponent } from './upcoming-transaction.component';

describe('UpcomingTransactionComponent', () => {
  let component: UpcomingTransactionComponent;
  let fixture: ComponentFixture<UpcomingTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpcomingTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
