import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UftFinancepaybleComponent } from './uft-financepayble.component';

describe('UftFinancepaybleComponent', () => {
  let component: UftFinancepaybleComponent;
  let fixture: ComponentFixture<UftFinancepaybleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UftFinancepaybleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UftFinancepaybleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
