import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DentalFeeGuideComponent } from './dental-fee-guide.component';

describe('DentalFeeGuideComponent', () => {
  let component: DentalFeeGuideComponent;
  let fixture: ComponentFixture<DentalFeeGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DentalFeeGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DentalFeeGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});