import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendmentWizardComponent } from './amendment-wizard.component';

describe('AmendmentWizardComponent', () => {
  let component: AmendmentWizardComponent;
  let fixture: ComponentFixture<AmendmentWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmendmentWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmendmentWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
