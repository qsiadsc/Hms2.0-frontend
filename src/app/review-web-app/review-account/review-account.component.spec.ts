import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewAccountComponent } from './review-account.component';

describe('ReviewAccountComponent', () => {
  let component: ReviewAccountComponent;
  let fixture: ComponentFixture<ReviewAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
