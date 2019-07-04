import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSubtitlesListComponent } from './item-subtitles-list.component';

describe('ItemSubtitlesListComponent', () => {
  let component: ItemSubtitlesListComponent;
  let fixture: ComponentFixture<ItemSubtitlesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSubtitlesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSubtitlesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
