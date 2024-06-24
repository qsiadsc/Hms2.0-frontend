import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TopUpMaximumsComponent } from './top-up-maximums.component';

describe('TopUpMaximumsComponent', () => {
  let component: TopUpMaximumsComponent;
  let fixture: ComponentFixture<TopUpMaximumsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopUpMaximumsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopUpMaximumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
