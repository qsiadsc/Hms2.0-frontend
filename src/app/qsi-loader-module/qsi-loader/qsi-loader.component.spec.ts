import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QsiLoaderComponent } from './qsi-loader.component';

describe('QsiLoaderComponent', () => {
  let component: QsiLoaderComponent;
  let fixture: ComponentFixture<QsiLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QsiLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QsiLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
