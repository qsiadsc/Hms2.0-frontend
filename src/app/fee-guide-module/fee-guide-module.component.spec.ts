import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeGuideModuleComponent } from './fee-guide-module.component';

describe('FeeGuideModuleComponent', () => {
  let component: FeeGuideModuleComponent;
  let fixture: ComponentFixture<FeeGuideModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeeGuideModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeGuideModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
