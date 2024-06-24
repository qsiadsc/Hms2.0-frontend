import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimInformationComponent } from './claim-information.component';

describe('ClaimInformationComponent', () => {
  let component: ClaimInformationComponent;
  let fixture: ComponentFixture<ClaimInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
