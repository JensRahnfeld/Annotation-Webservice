import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundingBoxListComponent } from './bounding-box-list.component';

describe('BoundingBoxListComponent', () => {
  let component: BoundingBoxListComponent;
  let fixture: ComponentFixture<BoundingBoxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoundingBoxListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoundingBoxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
