import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimsDialogueComponent } from './claims-dialogue.component';

describe('ClaimsDialogueComponent', () => {
  let component: ClaimsDialogueComponent;
  let fixture: ComponentFixture<ClaimsDialogueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsDialogueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});