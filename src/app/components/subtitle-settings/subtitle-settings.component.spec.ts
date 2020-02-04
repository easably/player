import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtitleSettingsComponent } from './subtitle-settings.component';

describe('SubtitleSettingsComponent', () => {
  let component: SubtitleSettingsComponent;
  let fixture: ComponentFixture<SubtitleSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtitleSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtitleSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
