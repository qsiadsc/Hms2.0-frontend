import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataQsiLoaderComponent } from './data-qsi-loader.component';

describe('DataQsiLoaderComponent', () => {
  let component: DataQsiLoaderComponent;
  let fixture: ComponentFixture<DataQsiLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataQsiLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataQsiLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
