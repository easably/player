import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterlinearComponent } from './interlinear.component';

describe('InterlinearComponent', () => {
  let component: InterlinearComponent;
  let fixture: ComponentFixture<InterlinearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterlinearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterlinearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
