import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportClaimLetterComponent } from './export-claim-letter.component';

describe('ExportClaimLetterComponent', () => {
  let component: ExportClaimLetterComponent;
  let fixture: ComponentFixture<ExportClaimLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportClaimLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportClaimLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
