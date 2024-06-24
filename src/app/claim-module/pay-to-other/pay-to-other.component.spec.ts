import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayToOtherComponent } from './pay-to-other.component';

describe('PayToOtherComponent', () => {
  let component: PayToOtherComponent;
  let fixture: ComponentFixture<PayToOtherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayToOtherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayToOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
