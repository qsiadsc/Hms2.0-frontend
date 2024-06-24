import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthServiceComponent } from './health-service.component';

describe('HealthServiceComponent', () => {
  let component: HealthServiceComponent;
  let fixture: ComponentFixture<HealthServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HealthServiceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});