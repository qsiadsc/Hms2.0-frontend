import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimMessageComponent } from './claim-message.component';

describe('ClaimMessageComponent', () => {
  let component: ClaimMessageComponent;
  let fixture: ComponentFixture<ClaimMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
