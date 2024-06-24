import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WellnessProcCodeComponent } from './wellness-proc-code.component';

describe('WellnessProcCodeComponent', () => {
  let component: WellnessProcCodeComponent;
  let fixture: ComponentFixture<WellnessProcCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WellnessProcCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WellnessProcCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});