import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-toggle-container',
  standalone: false,
  templateUrl: './toggle-container.component.html',
  styleUrl: './toggle-container.component.scss',
  animations: [
    trigger('expandCollapse', [
      state(
        'open',
        style({
          height: '*',
          opacity: 1,
          padding: '*',
          overflow: 'hidden',
        }),
      ),
      state(
        'closed',
        style({
          height: '0px',
          opacity: 0,
          padding: '0px',
          overflow: 'hidden',
          transform: 'translateY(-10px)',
        }),
      ),
      transition('open <=> closed', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class ToggleContainerComponent {
  @Input() open: boolean = false;
  @Output() openChange = new EventEmitter<boolean>();

  close() {
    this.open = false;
    this.openChange.emit(this.open);
  }
}
