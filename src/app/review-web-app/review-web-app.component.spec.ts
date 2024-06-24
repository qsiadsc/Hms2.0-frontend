import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewWebAppComponent } from './review-web-app.component';

describe('ReviewWebAppComponent', () => {
  let component: ReviewWebAppComponent;
  let fixture: ComponentFixture<ReviewWebAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewWebAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewWebAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
