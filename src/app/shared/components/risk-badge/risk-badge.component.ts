import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NivelRiesgo } from '../../models/riesgo.model';
import { ChipColor, ChipComponent } from '../chip/chip.component';

const ETIQUETAS: Record<NivelRiesgo, string> = {
  OK: 'OK',
  WARNING: 'Advertencia',
  CRITICAL: 'Crítico',
  OVERDUE: 'Vencido'
};

const COLORES: Record<NivelRiesgo, ChipColor> = {
  OK: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
  OVERDUE: 'secondary'
};

const ICONOS: Record<NivelRiesgo, string> = {
  OK: 'check_circle',
  WARNING: 'schedule',
  CRITICAL: 'warning',
  OVERDUE: 'error'
};

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [ChipComponent, MatIconModule],
  templateUrl: './risk-badge.component.html'
})
export class RiskBadgeComponent {
  readonly nivel = input.required<NivelRiesgo>();

  readonly etiqueta = computed(() => ETIQUETAS[this.nivel()]);
  readonly color = computed(() => COLORES[this.nivel()]);
  readonly icono = computed(() => ICONOS[this.nivel()]);
}
