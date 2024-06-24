import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateClaimItemComponent } from './duplicate-claim-item.component';

describe('DuplicateClaimItemComponent', () => {
  let component: DuplicateClaimItemComponent;
  let fixture: ComponentFixture<DuplicateClaimItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateClaimItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateClaimItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
