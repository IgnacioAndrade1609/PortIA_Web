import { Component, input } from '@angular/core';

export type ChipColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'purple';

@Component({
  selector: 'app-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  readonly color = input<ChipColor>('neutral');
}
