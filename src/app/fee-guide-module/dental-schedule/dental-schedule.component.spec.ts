import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DentalScheduleComponent } from './dental-schedule.component';

describe('DentalScheduleComponent', () => {
  let component: DentalScheduleComponent;
  let fixture: ComponentFixture<DentalScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DentalScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DentalScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});