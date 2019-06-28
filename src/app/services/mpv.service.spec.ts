import { TestBed } from '@angular/core/testing';

import { MpvService } from './mpv.service';

describe('MpvService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MpvService = TestBed.get(MpvService);
    expect(service).toBeTruthy();
  });
});
