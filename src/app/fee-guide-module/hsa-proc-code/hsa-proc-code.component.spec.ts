import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HsaProcCodeComponent } from './hsa-proc-code.component';

describe('HsaProcCodeComponent', () => {
  let component: HsaProcCodeComponent;
  let fixture: ComponentFixture<HsaProcCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HsaProcCodeComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HsaProcCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});