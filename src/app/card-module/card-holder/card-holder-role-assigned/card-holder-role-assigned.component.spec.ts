import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardHolderRoleAssignedComponent } from './card-holder-role-assigned.component';

describe('CardHolderRoleAssignedComponent', () => {
  let component: CardHolderRoleAssignedComponent;
  let fixture: ComponentFixture<CardHolderRoleAssignedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardHolderRoleAssignedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardHolderRoleAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});