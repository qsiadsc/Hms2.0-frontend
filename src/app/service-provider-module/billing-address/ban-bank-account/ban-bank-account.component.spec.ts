import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BanBankAccountComponent } from './ban-bank-account.component';

describe('BanBankAccountComponent', () => {
  let component: BanBankAccountComponent;
  let fixture: ComponentFixture<BanBankAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BanBankAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BanBankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
