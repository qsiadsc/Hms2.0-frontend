import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRolesAddEditComponent } from './user-roles-add-edit.component';

describe('UserRolesAddEditComponent', () => {
  let component: UserRolesAddEditComponent;
  let fixture: ComponentFixture<UserRolesAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRolesAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRolesAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
