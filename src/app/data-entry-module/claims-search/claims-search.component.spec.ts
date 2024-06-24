import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsSearchComponent } from './claims-search.component';

describe('ClaimsSearchComponent', () => {
  let component: ClaimsSearchComponent;
  let fixture: ComponentFixture<ClaimsSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
