import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OriginatorComponent } from './originator.component';

describe('OriginatorComponent', () => {
  let component: OriginatorComponent;
  let fixture: ComponentFixture<OriginatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OriginatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OriginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
