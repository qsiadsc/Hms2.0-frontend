import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewDentalFeeGuideComponent } from './view-dental-fee-guide.component';

describe('ViewDentalFeeGuideComponent', () => {
  let component: ViewDentalFeeGuideComponent;
  let fixture: ComponentFixture<ViewDentalFeeGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDentalFeeGuideComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDentalFeeGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});