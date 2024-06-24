import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateClaimListComponent } from './duplicate-claim-list.component';

describe('DuplicateClaimListComponent', () => {
  let component: DuplicateClaimListComponent;
  let fixture: ComponentFixture<DuplicateClaimListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicateClaimListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateClaimListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
