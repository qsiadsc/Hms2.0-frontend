import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentModelComponent } from './comment-model.component';

describe('CommentModelComponent', () => {
  let component: CommentModelComponent;
  let fixture: ComponentFixture<CommentModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
