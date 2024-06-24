import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchServiceProviderComponent } from './search-service-provider.component';

describe('SearchServiceProviderComponent', () => {
  let component: SearchServiceProviderComponent;
  let fixture: ComponentFixture<SearchServiceProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchServiceProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
