import { AfterViewInit, Directive, ElementRef, OnDestroy, Renderer2 } from '@angular/core';

const FILLED_COLOR = '#0f172a'; // slate-900 — matches the app's emphasized text color

// Darkens a field's <label> once its control (input/select/textarea) has a value.
// Usage: add [appFieldGroup] on the wrapper element containing exactly one
// <label> and one form control. Works across both design systems in this app
// (Material tokens and Tailwind slate) since it overrides via inline style
// rather than toggling a specific utility class.
@Directive({
  standalone: true,
  selector: '[appFieldGroup]',
})
export class FieldGroupDirective implements AfterViewInit, OnDestroy {
  private cleanups: Array<() => void> = [];

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    const label = this.el.nativeElement.querySelector('label');
    const control = this.el.nativeElement.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      'input:not([type=checkbox]):not([type=radio]), select, textarea',
    );
    if (!label || !control) return;

    const update = () => {
      const value = control.value;
      const filled = value !== null && value !== undefined && String(value).trim() !== '';
      if (filled) {
        this.renderer.setStyle(label, 'color', FILLED_COLOR);
      } else {
        this.renderer.removeStyle(label, 'color');
      }
    };

    update();
    this.cleanups.push(this.renderer.listen(control, 'input', update));
    this.cleanups.push(this.renderer.listen(control, 'change', update));
  }

  ngOnDestroy(): void {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}
