import { inject, Injectable, signal } from '@angular/core';
import { BoundingBox, BoundingBoxService } from './bounding-box.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  selectedFileName = signal('');
  loadingFileNames = signal(false);
  error = signal<string | null>(null); // New signal for error handling

  boundingBoxesSubject = new BehaviorSubject<BoundingBox[]>([]);
  boundingBoxes$ = this.boundingBoxesSubject.asObservable();
  boundingBoxService = inject(BoundingBoxService);

  setSelectedFileName(filename: string) {
    this.selectedFileName.set(filename);
  }

  setBoundingBoxes(boundingBoxes: BoundingBox[]): void {
    this.boundingBoxesSubject.next(boundingBoxes);
  }

  fetchBoundingBoxes(filename: string): void {
    if (filename === '') {
      this.setBoundingBoxes([]);
      return;
    }

    this.boundingBoxService
      .getBoundingBoxes(filename)
      .subscribe((boundingBoxes: BoundingBox[]) => {
        this.setBoundingBoxes(boundingBoxes);
      });
  }

  addBoundingBox(
    filename: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    this.boundingBoxService
      .addBoundingBox(filename, x, y, w, h)
      .subscribe((boundingBox: BoundingBox) => {
        const updatedBoundingBoxes = [
          ...this.boundingBoxesSubject.getValue(),
          boundingBox,
        ];
        this.setBoundingBoxes(updatedBoundingBoxes);
      });
  }

  deleteBoundingBox(id: string): void {
    const updatedBoundingBoxes = this.boundingBoxesSubject
      .getValue()
      .filter((box) => box.id !== id);
    this.setBoundingBoxes(updatedBoundingBoxes);

    this.boundingBoxService.deleteBoundingBox(id).subscribe(() => {
      this.setBoundingBoxes(updatedBoundingBoxes);
    });
  }
}
