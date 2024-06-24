import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentEditModelComponent } from './comment-edit-model.component';

describe('CommentEditModelComponent', () => {
  let component: CommentEditModelComponent;
  let fixture: ComponentFixture<CommentEditModelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentEditModelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentEditModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
