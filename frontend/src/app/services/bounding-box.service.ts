import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BoundingBox {
  id: string;
  filename: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

@Injectable({
  providedIn: 'root',
})
export class BoundingBoxService {
  public readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getBoundingBoxes(filename: string): Observable<BoundingBox[]> {
    return this.http.get<BoundingBox[]>(
      `${this.apiUrl}/bounding_boxes/${filename}`,
    );
  }

  addBoundingBox(
    filename: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): Observable<BoundingBox> {
    const boundingBoxCoordinates = {
      x: x,
      y: y,
      w: w,
      h: h,
    };
    return this.http.post<BoundingBox>(
      `${this.apiUrl}/bounding_boxes/${filename}`,
      boundingBoxCoordinates,
    );
  }

  deleteBoundingBox(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bounding_boxes/${id}`);
  }
}
