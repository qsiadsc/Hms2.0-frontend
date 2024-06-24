import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DentistInfoComponent } from './dentist-info.component';

describe('DentistInfoComponent', () => {
  let component: DentistInfoComponent;
  let fixture: ComponentFixture<DentistInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DentistInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DentistInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
