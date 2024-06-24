import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimTotalComponent } from './claim-total.component';

describe('ClaimTotalComponent', () => {
  let component: ClaimTotalComponent;
  let fixture: ComponentFixture<ClaimTotalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimTotalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
