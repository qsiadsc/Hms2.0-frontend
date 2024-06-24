import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FinanceModuleComponent } from './finance-module.component';

describe('FinanceModuleComponent', () => {
  let component: FinanceModuleComponent;
  let fixture: ComponentFixture<FinanceModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
