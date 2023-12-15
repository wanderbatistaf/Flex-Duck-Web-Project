// zoom-out.directive.ts

import { Directive, ElementRef, Renderer2, HostListener, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appZoomOut]',
})
export class ZoomOutDirective implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('window:resize', ['$event'])
  @HostListener('window:load', ['$event']) // Adicionando window:load
  onResize(event: Event): void {
    this.adjustZoom();
  }

  ngAfterViewInit(): void {
    this.adjustZoom();
  }

  private adjustZoom(): void {
    const screenWidth = window.innerWidth;

    // Defina a largura de referência, por exemplo, 1080 pixels.
    const referenceWidth = 1080;

    // Defina a porcentagem de zoom-out desejada.
    const zoomPercentage = 80;

    const zoomFactor = (screenWidth / referenceWidth) * (zoomPercentage / 100);

    this.renderer.setStyle(this.el.nativeElement, 'transform', `scale(${zoomFactor})`);
  }
}
