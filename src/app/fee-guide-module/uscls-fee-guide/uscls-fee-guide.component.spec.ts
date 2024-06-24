import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UsclsFeeGuideComponent } from './uscls-fee-guide.component';

describe('UsclsFeeGuideComponent', () => {
  let component: UsclsFeeGuideComponent;
  let fixture: ComponentFixture<UsclsFeeGuideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsclsFeeGuideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsclsFeeGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});