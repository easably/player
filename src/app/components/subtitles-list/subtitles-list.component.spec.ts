import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtitlesListComponent } from './subtitles-list.component';

describe('SubtitlesListComponent', () => {
  let component: SubtitlesListComponent;
  let fixture: ComponentFixture<SubtitlesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtitlesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtitlesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
