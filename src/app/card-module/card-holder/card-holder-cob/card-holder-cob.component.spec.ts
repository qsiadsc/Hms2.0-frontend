import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderCobComponent } from './card-holder-cob.component';

describe('CardHolderCobComponent', () => {
  let component: CardHolderCobComponent;
  let fixture: ComponentFixture<CardHolderCobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderCobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderCobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});