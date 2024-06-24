import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchCardHolderComponent } from './search-card-holder.component';

describe('SearchCardHolderComponent', () => {
  let component: SearchCardHolderComponent;
  let fixture: ComponentFixture<SearchCardHolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchCardHolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCardHolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});