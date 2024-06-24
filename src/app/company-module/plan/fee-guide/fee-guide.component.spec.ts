import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeGuideComponent } from './fee-guide.component';

describe('FeeGuideComponent', () => {
  let component: FeeGuideComponent;
  let fixture: ComponentFixture<FeeGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeeGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
