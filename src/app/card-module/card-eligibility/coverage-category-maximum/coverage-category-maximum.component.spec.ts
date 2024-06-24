import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CoverageCategoryMaximumComponent } from './coverage-category-maximum.component';

describe('CoverageCategoryMaximumComponent', () => {
  let component: CoverageCategoryMaximumComponent;
  let fixture: ComponentFixture<CoverageCategoryMaximumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverageCategoryMaximumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverageCategoryMaximumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
