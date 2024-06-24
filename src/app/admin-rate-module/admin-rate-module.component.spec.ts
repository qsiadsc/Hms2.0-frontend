import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminRateModuleComponent } from './admin-rate-module.component';

describe('AdminRateModuleComponent', () => {
  let component: AdminRateModuleComponent;
  let fixture: ComponentFixture<AdminRateModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRateModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRateModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});