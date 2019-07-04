import { TestBed } from '@angular/core/testing';

import { SubtitlesService } from './subtitles.service';

describe('SubtitlesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SubtitlesService = TestBed.get(SubtitlesService);
    expect(service).toBeTruthy();
  });
});
