import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibilityFilesComponent } from './eligibility-files.component';

describe('EligibilityFilesComponent', () => {
  let component: EligibilityFilesComponent;
  let fixture: ComponentFixture<EligibilityFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EligibilityFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EligibilityFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
