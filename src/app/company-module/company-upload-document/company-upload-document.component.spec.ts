import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyUploadDocumentComponent } from './company-upload-document.component';

describe('CompanyUploadDocumentComponent', () => {
  let component: CompanyUploadDocumentComponent;
  let fixture: ComponentFixture<CompanyUploadDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyUploadDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyUploadDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
