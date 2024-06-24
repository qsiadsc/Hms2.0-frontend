import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrokerAddComponent } from './broker-add.component';

describe('BrokerAddComponent', () => {
  let component: BrokerAddComponent;
  let fixture: ComponentFixture<BrokerAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrokerAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrokerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
