import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ImageService } from '../../services/image.service';
import { StateService } from '../../services/state.service';
import {
  BoundingBox,
  BoundingBoxService,
} from '../../services/bounding-box.service';
import { Subscription } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  imports: [NgStyle],
  templateUrl: './image-viewer.component.html',
})
export class ImageViewerComponent implements AfterViewInit {
  stateService = inject(StateService);
  boundingBoxService = inject(BoundingBoxService);
  imageService = inject(ImageService);
  boundingBoxesSubscription!: Subscription;
  boundingBoxes = signal<BoundingBox[]>([]);
  filename = toObservable(this.stateService.selectedFileName);
  image = new Image();
  opacity = signal(1);

  // canvas properties for listening to mouse events
  private ctx!: CanvasRenderingContext2D | null;
  private canvasSizeRatio = 0.7;
  private startX = 0;
  private startY = 0;
  private isDrawing = false;
  private tempBoundingBox: BoundingBox | null = null;

  @ViewChild('annotationCanvas', { static: false })
  canvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.canvas.nativeElement.width = window.innerWidth * this.canvasSizeRatio;
    this.canvas.nativeElement.height =
      window.innerHeight * this.canvasSizeRatio;
    this.canvas.nativeElement.classList.add('bg-gray-100');
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.filename.subscribe((filename) => {
      this.opacity.set(0);
      this.image.src = this.imageService.getImageUrl(filename);
      this.image.onload = () => {
        setTimeout(() => {
          this.redrawBoundingBoxes(this.boundingBoxes());
          this.opacity.set(1);
        }, 100);
      };
      this.boundingBoxesSubscription =
        this.stateService.boundingBoxes$.subscribe(
          (boundingBoxes: BoundingBox[]) => {
            this.boundingBoxes.set(boundingBoxes);
            this.redrawBoundingBoxes(boundingBoxes);
          },
        );
    });
    this.addCanvasEventListeners();
  }

  onResize(event: Event): void {
    const target = event.target as Window;
    this.canvas.nativeElement.width = target.innerWidth * this.canvasSizeRatio;
    this.canvas.nativeElement.height =
      target.innerHeight * this.canvasSizeRatio;
    this.redrawBoundingBoxes(this.boundingBoxes());
  }

  redrawBoundingBoxes(boundingBoxes: BoundingBox[]): void {
    if (!this.ctx) return;
    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height,
    );
    this.ctx?.drawImage(
      this.image,
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height,
    );
    for (const bbox of boundingBoxes) {
      this.drawBoundingBox(bbox, 'red');
    }
  }

  drawBoundingBox(boundingBox: BoundingBox, color: string = 'red'): void {
    if (this.ctx) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1;
      const bbox_downscaled = {
        x:
          (boundingBox.x * this.canvas.nativeElement.width) /
          this.image.naturalWidth,
        y:
          (boundingBox.y * this.canvas.nativeElement.height) /
          this.image.naturalHeight,
        w:
          (boundingBox.w * this.canvas.nativeElement.width) /
          this.image.naturalWidth,
        h:
          (boundingBox.h * this.canvas.nativeElement.height) /
          this.image.naturalHeight,
      };
      this.ctx.strokeRect(
        bbox_downscaled.x,
        bbox_downscaled.y,
        bbox_downscaled.w,
        bbox_downscaled.h,
      );
    }
  }

  // Add mouse event listeners to the canvas
  private addCanvasEventListeners(): void {
    const canvasElement = this.canvas.nativeElement;

    canvasElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvasElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvasElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvasElement.addEventListener('mouseleave', this.onMouseUp.bind(this));
  }

  // Mouse down event to start drawing a bounding box
  private onMouseDown(event: MouseEvent): void {
    if (!this.ctx || this.stateService.selectedFileName() === '') return;
    this.isDrawing = true;
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    this.startX =
      (event.clientX - rect.left) *
      (this.image.naturalWidth / this.canvas.nativeElement.width);
    this.startY =
      (event.clientY - rect.top) *
      (this.image.naturalHeight / this.canvas.nativeElement.height);

    this.tempBoundingBox = {
      id: '',
      filename: this.stateService.selectedFileName(),
      x: this.startX,
      y: this.startY,
      w: 0,
      h: 0,
    };
  }

  // Mouse move event to update the bounding box while drawing
  private onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || !this.tempBoundingBox) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const currentX =
      ((event.clientX - rect.left) * this.image.naturalWidth) /
      this.canvas.nativeElement.width;
    const currentY =
      ((event.clientY - rect.top) * this.image.naturalHeight) /
      this.canvas.nativeElement.height;

    if (currentX < this.startX) {
      this.tempBoundingBox.x = currentX;
      this.tempBoundingBox.w = this.startX - currentX;
    } else {
      this.tempBoundingBox.x = this.startX;
      this.tempBoundingBox.w = currentX - this.startX;
    }
    if (currentY < this.startY) {
      this.tempBoundingBox.y = currentY;
      this.tempBoundingBox.h = this.startY - currentY;
    } else {
      this.tempBoundingBox.y = this.startY;
      this.tempBoundingBox.h = currentY - this.startY;
    }

    this.redrawBoundingBoxes(this.boundingBoxes());
    this.drawBoundingBox(this.tempBoundingBox, 'red');
  }

  // Mouse up event to finalize the bounding box
  private onMouseUp(event: MouseEvent): void {
    if (!this.isDrawing || !this.tempBoundingBox) return;

    this.isDrawing = false;

    // Create the new bounding box
    const newBoundingBox: BoundingBox = {
      id: '',
      filename: this.stateService.selectedFileName(),
      x: this.tempBoundingBox.x,
      y: this.tempBoundingBox.y,
      w: this.tempBoundingBox.w,
      h: this.tempBoundingBox.h,
    };

    this.stateService.addBoundingBox(
      newBoundingBox.filename,
      newBoundingBox.x,
      newBoundingBox.y,
      newBoundingBox.w,
      newBoundingBox.h,
    );
  }

  ngOnDestroy(): void {
    if (this.boundingBoxesSubscription) {
      this.boundingBoxesSubscription.unsubscribe();
    }
  }
}
