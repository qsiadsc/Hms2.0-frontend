import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindProcComponent } from './find-proc.component';

describe('FindProcComponent', () => {
  let component: FindProcComponent;
  let fixture: ComponentFixture<FindProcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindProcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindProcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
