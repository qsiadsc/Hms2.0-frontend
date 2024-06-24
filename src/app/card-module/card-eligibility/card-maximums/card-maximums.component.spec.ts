import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardMaximumsComponent } from './card-maximums.component';

describe('CardMaximumsComponent', () => {
  let component: CardMaximumsComponent;
  let fixture: ComponentFixture<CardMaximumsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardMaximumsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardMaximumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});