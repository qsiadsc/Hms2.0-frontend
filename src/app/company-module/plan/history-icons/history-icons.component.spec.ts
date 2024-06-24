import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryIconsComponent } from './history-icons.component';

describe('HistoryIconsComponent', () => {
  let component: HistoryIconsComponent;
  let fixture: ComponentFixture<HistoryIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryIconsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
