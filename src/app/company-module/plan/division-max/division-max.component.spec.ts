import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionMaxComponent } from './division-max.component';

describe('DivisionMaxComponent', () => {
  let component: DivisionMaxComponent;
  let fixture: ComponentFixture<DivisionMaxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionMaxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionMaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
