import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcedureCodeComponent } from './procedure-code.component';

describe('ProcedureCodeComponent', () => {
  let component: ProcedureCodeComponent;
  let fixture: ComponentFixture<ProcedureCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcedureCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcedureCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});