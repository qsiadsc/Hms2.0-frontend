import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimSecureComponent } from './claim-secure.component';

describe('ClaimSecureComponent', () => {
  let component: ClaimSecureComponent;
  let fixture: ComponentFixture<ClaimSecureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimSecureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimSecureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
