import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    
    const menuButton = document.querySelector('.menu-button');
    const clickedOnMenuButton = menuButton?.contains(target);
    
    if (!clickedInside && !clickedOnMenuButton) {
      this.clickOutside.emit();
    }
  }
}