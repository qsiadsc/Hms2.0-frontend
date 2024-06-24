import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HsaServiceComponent } from './hsa-service.component';

describe('HsaServiceComponent', () => {
  let component: HsaServiceComponent;
  let fixture: ComponentFixture<HsaServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HsaServiceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HsaServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});