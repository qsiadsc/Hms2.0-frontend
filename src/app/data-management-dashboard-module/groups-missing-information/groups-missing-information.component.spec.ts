import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsMissingInformationComponent } from './groups-missing-information.component';

describe('GroupsMissingInformationComponent', () => {
  let component: GroupsMissingInformationComponent;
  let fixture: ComponentFixture<GroupsMissingInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsMissingInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsMissingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
