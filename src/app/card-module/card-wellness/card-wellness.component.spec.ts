import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardWellnessComponent } from './card-wellness.component';

describe('CardWellnessComponent', () => {
  let component: CardWellnessComponent;
  let fixture: ComponentFixture<CardWellnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardWellnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardWellnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
