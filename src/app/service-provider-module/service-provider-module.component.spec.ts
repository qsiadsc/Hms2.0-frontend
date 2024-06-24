import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceProviderModuleComponent } from './service-provider-module.component';

describe('ServiceProviderModuleComponent', () => {
  let component: ServiceProviderModuleComponent;
  let fixture: ComponentFixture<ServiceProviderModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceProviderModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceProviderModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
