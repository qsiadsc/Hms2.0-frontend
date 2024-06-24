import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomainModuleComponent } from './domain-module.component';

describe('DomainModuleComponent', () => {
  let component: DomainModuleComponent;
  let fixture: ComponentFixture<DomainModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DomainModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DomainModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
