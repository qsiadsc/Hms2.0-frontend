import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BenfiitCoverageCategoryMaximumComponent } from './benfiit-coverage-category-maximum.component';

describe('BenfiitCoverageCategoryMaximumComponent', () => {
  let component: BenfiitCoverageCategoryMaximumComponent;
  let fixture: ComponentFixture<BenfiitCoverageCategoryMaximumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BenfiitCoverageCategoryMaximumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BenfiitCoverageCategoryMaximumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});