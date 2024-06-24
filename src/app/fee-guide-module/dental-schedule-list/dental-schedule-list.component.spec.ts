import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DentalScheduleListComponent } from './dental-schedule-list.component';

describe('DentalScheduleListComponent', () => {
  let component: DentalScheduleListComponent;
  let fixture: ComponentFixture<DentalScheduleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DentalScheduleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DentalScheduleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});