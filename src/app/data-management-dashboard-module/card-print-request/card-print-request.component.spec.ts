import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPrintRequestComponent } from './card-print-request.component';

describe('CardPrintRequestComponent', () => {
  let component: CardPrintRequestComponent;
  let fixture: ComponentFixture<CardPrintRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardPrintRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPrintRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
