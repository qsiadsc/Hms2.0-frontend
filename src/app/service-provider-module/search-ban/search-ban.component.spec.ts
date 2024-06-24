import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBanComponent } from './search-ban.component';

describe('SearchBanComponent', () => {
  let component: SearchBanComponent;
  let fixture: ComponentFixture<SearchBanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
