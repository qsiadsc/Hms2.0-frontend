import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RuleAddEditComponent } from './rule-add-edit.component';

describe('RuleAddEditComponent', () => {
  let component: RuleAddEditComponent;
  let fixture: ComponentFixture<RuleAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
