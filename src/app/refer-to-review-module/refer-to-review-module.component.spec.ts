import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferToReviewModuleComponent } from './refer-to-review-module.component';

describe('ReferToReviewModuleComponent', () => {
  let component: ReferToReviewModuleComponent;
  let fixture: ComponentFixture<ReferToReviewModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReferToReviewModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferToReviewModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
