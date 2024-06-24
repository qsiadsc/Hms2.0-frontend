import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataEntryHeaderComponent } from './data-entry-header.component';

describe('DataEntryHeaderComponent', () => {
  let component: DataEntryHeaderComponent;
  let fixture: ComponentFixture<DataEntryHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataEntryHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataEntryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
