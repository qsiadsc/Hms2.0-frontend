import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdaNetComponent } from './cda-net.component';

describe('CdaNetComponent', () => {
  let component: CdaNetComponent;
  let fixture: ComponentFixture<CdaNetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdaNetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdaNetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
