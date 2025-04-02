import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageFile {
  id: string;
  filename: string;
  thumb_filename: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  public readonly apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  getImages(): Observable<ImageFile[]> {
    return this.http.get<ImageFile[]>(`${this.apiUrl}/files/`);
  }

  getImageUrl(filename: string): string {
    return `${this.apiUrl}/files/${filename}`;
  }
}
