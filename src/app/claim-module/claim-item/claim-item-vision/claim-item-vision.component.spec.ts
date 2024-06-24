import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimItemVisionComponent } from './claim-item-vision.component';

describe('ClaimItemVisionComponent', () => {
  let component: ClaimItemVisionComponent;
  let fixture: ComponentFixture<ClaimItemVisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimItemVisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimItemVisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
