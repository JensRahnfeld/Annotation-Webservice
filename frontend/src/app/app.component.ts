import { Component, inject } from '@angular/core';

import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { StateService } from './services/state.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-root',
  imports: [ImageViewerComponent, NavBarComponent, MatProgressSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  stateService = inject(StateService);
}
