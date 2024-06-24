import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ItransViewerModuleComponent } from './itrans-viewer-module.component';

describe('ItransViewerModuleComponent', () => {
  let component: ItransViewerModuleComponent;
  let fixture: ComponentFixture<ItransViewerModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItransViewerModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItransViewerModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
