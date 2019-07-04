import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoSubtitleComponent } from './video-subtitle.component';

describe('VideoSubtitleComponent', () => {
  let component: VideoSubtitleComponent;
  let fixture: ComponentFixture<VideoSubtitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoSubtitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoSubtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
