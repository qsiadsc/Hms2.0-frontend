import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersModuleComponent } from './users-module.component';

describe('UsersModuleComponent', () => {
  let component: UsersModuleComponent;
  let fixture: ComponentFixture<UsersModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
