import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RulesSearchFilterComponent } from './rules-search-filter.component';

describe('RulesSearchFilterComponent', () => {
  let component: RulesSearchFilterComponent;
  let fixture: ComponentFixture<RulesSearchFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RulesSearchFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesSearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
