import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VissionProcCodeComponent } from './vission-proc-code.component';

describe('VissionProcCodeComponent', () => {
  let component: VissionProcCodeComponent;
  let fixture: ComponentFixture<VissionProcCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VissionProcCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VissionProcCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});