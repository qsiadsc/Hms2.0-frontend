import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateClaimItemListingComponent } from './duplicate-claim-item-listing.component';

describe('DuplicateClaimItemListingComponent', () => {
  let component: DuplicateClaimItemListingComponent;
  let fixture: ComponentFixture<DuplicateClaimItemListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateClaimItemListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateClaimItemListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
