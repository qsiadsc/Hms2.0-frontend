import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimItemDentalComponent } from './claim-item-dental.component';

describe('ClaimItemDentalComponent', () => {
  let component: ClaimItemDentalComponent;
  let fixture: ComponentFixture<ClaimItemDentalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimItemDentalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimItemDentalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
