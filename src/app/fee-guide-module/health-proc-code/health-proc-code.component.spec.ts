import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthProcCodeComponent } from './health-proc-code.component';

describe('HealthProcCodeComponent', () => {
  let component: HealthProcCodeComponent;
  let fixture: ComponentFixture<HealthProcCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthProcCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthProcCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});