import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UsclsComponent } from './uscls.component';

describe('UsclsComponent', () => {
  let component: UsclsComponent;
  let fixture: ComponentFixture<UsclsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UsclsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsclsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});