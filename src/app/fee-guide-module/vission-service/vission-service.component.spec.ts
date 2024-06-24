import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VissionServiceComponent } from './vission-service.component';

describe('VissionServiceComponent', () => {
  let component: VissionServiceComponent;
  let fixture: ComponentFixture<VissionServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VissionServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VissionServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});