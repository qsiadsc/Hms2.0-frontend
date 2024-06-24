import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEntryModuleComponent } from './data-entry-module.component';

describe('DataEntryModuleComponent', () => {
  let component: DataEntryModuleComponent;
  let fixture: ComponentFixture<DataEntryModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataEntryModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataEntryModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
