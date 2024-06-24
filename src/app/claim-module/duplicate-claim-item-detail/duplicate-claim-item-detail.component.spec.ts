import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateClaimItemDetailComponent } from './duplicate-claim-item-detail.component';

describe('DuplicateClaimItemDetailComponent', () => {
  let component: DuplicateClaimItemDetailComponent;
  let fixture: ComponentFixture<DuplicateClaimItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateClaimItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateClaimItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
