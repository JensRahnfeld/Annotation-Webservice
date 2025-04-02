import { Component, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { BoundingBoxListComponent } from '../bounding-box-list/bounding-box-list.component';
import { StateService } from '../../services/state.service';
import { ImageService } from '../../services/image.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  imports: [
    BoundingBoxListComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './nav-bar.component.html',
})
export class NavBarComponent implements OnInit {
  stateService = inject(StateService);
  imageService = inject(ImageService);
  filenames = signal<string[]>([]);

  ngOnInit(): void {
    this.stateService.loadingFileNames.set(true);
    this.imageService
      .getImages()
      .pipe(
        catchError((err) => {
          console.log(err);
          throw err;
        }),
      )
      .subscribe({
        next: (imageFiles) => {
          this.filenames.set(imageFiles.map((imageFile) => imageFile.filename));
          this.stateService.loadingFileNames.set(false);
        },
      });
  }
}
