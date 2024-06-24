import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDentalServiceComponent } from './add-dental-service.component';

describe('AddDentalServiceComponent', () => {
  let component: AddDentalServiceComponent;
  let fixture: ComponentFixture<AddDentalServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDentalServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDentalServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});