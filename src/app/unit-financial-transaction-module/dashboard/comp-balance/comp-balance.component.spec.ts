import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CompBalanceComponent } from './comp-balance.component';

describe('CompBalanceComponent', () => {
  let component: CompBalanceComponent;
  let fixture: ComponentFixture<CompBalanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompBalanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
