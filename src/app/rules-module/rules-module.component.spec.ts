import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RulesModuleComponent } from './rules-module.component';

describe('RulesModuleComponent', () => {
  let component: RulesModuleComponent;
  let fixture: ComponentFixture<RulesModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RulesModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
