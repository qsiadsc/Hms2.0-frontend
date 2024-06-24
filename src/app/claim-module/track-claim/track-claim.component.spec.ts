import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackClaimComponent } from './track-claim.component';

describe('TrackClaimComponent', () => {
  let component: TrackClaimComponent;
  let fixture: ComponentFixture<TrackClaimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackClaimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
