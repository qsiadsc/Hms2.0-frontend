import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEntryAccountComponent } from './data-entry-account.component';

describe('DataEntryAccountComponent', () => {
  let component: DataEntryAccountComponent;
  let fixture: ComponentFixture<DataEntryAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataEntryAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataEntryAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
