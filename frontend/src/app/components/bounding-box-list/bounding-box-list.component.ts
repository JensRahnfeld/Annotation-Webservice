import {
  Component,
  inject,
  Input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StateService } from '../../services/state.service';
import { BoundingBox } from '../../services/bounding-box.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-bounding-box-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    DecimalPipe,
  ],
  templateUrl: './bounding-box-list.component.html',
})
export class BoundingBoxListComponent implements OnChanges {
  @Input() filename: string = '';
  stateService = inject(StateService);
  boundingBoxes = signal<BoundingBox[]>([]);
  loading = signal(true);
  error = signal<string | null>(null); // New signal for error handling

  constructor() {
    this.stateService.boundingBoxes$.subscribe({
      next: (boundingBoxes) => {
        this.boundingBoxes.set(boundingBoxes);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to fetch bounding boxes'); // Set error message
        console.error('Error fetching bounding boxes:', err);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.filename) {
      this.loading.set(true);
      this.error.set(null); // Clear error before fetching new data
      this.stateService.fetchBoundingBoxes(this.filename);
    }
  }
}
