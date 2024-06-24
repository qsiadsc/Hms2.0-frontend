import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QsiLoaderReportComponent } from './qsi-loader-report.component';

describe('QsiLoaderReportComponent', () => {
  let component: QsiLoaderReportComponent;
  let fixture: ComponentFixture<QsiLoaderReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QsiLoaderReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QsiLoaderReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
