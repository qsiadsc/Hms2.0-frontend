import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TrusteeInformationComponent } from './trustee-information.component';

describe('TrusteeInformationComponent', () => {
  let component: TrusteeInformationComponent;
  let fixture: ComponentFixture<TrusteeInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrusteeInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrusteeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});