import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenFilePopupComponent } from './open-file-popup.component';

describe('OpenFilePopupComponent', () => {
  let component: OpenFilePopupComponent;
  let fixture: ComponentFixture<OpenFilePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFilePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFilePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
