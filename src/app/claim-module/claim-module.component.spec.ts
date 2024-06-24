import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimModuleComponent } from './claim-module.component';

describe('ClaimModuleComponent', () => {
  let component: ClaimModuleComponent;
  let fixture: ComponentFixture<ClaimModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
