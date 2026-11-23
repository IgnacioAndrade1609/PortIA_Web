import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ContainerService } from '../../../../shared/services/container.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ContainerDetail } from '../../../../shared/models/container.model';

@Component({
  selector: 'app-container-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    RiskBadgeComponent
  ],
  templateUrl: './container-detail.component.html',
  styleUrl: './container-detail.component.css'
})
export class ContainerDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly containerService = inject(ContainerService);
  private readonly auth = inject(AuthService);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly detalle = signal<ContainerDetail | undefined>(undefined);
  readonly cargando = signal(true);
  readonly puedeEditarDiasLibres = computed(() => this.auth.rol() === 'Analista');

  readonly editando = signal(false);
  readonly diasDemurrageForm = signal(0);
  readonly diasDetentionForm = signal(0);

  readonly mostrandoFormArribo = signal(false);
  readonly fechaArriboForm = signal('');

  readonly accionEnCurso = signal(false);
  readonly errorAccion = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.containerService.getDetalle(this.id).subscribe({
      next: (detalle) => {
        this.detalle.set(detalle);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  iniciarEdicion(): void {
    const actual = this.detalle();
    if (!actual) return;
    this.diasDemurrageForm.set(actual.diasLibresDemurrage);
    this.diasDetentionForm.set(actual.diasLibresDetention);
    this.editando.set(true);
  }

  guardarDiasLibres(): void {
    this.ejecutarAccion(
      this.containerService.actualizarDiasLibres(this.id, this.diasDemurrageForm(), this.diasDetentionForm()),
      () => this.editando.set(false)
    );
  }

  cancelarEdicion(): void {
    this.editando.set(false);
  }

  marcarRetiro(): void {
    this.ejecutarAccion(this.containerService.marcarRetiro(this.id));
  }

  marcarDevolucionVacia(): void {
    this.ejecutarAccion(this.containerService.marcarDevolucionVacia(this.id));
  }

  mostrarFormArribo(): void {
    this.fechaArriboForm.set(new Date().toISOString().slice(0, 10));
    this.mostrandoFormArribo.set(true);
  }

  cancelarArribo(): void {
    this.mostrandoFormArribo.set(false);
  }

  confirmarArriboReal(): void {
    if (!this.fechaArriboForm()) return;
    const fechaIso = new Date(this.fechaArriboForm()).toISOString();
    this.ejecutarAccion(
      this.containerService.confirmarArriboReal(this.id, fechaIso),
      () => this.mostrandoFormArribo.set(false)
    );
  }

  imprimir(): void {
    window.print();
  }

  private ejecutarAccion(accion: Observable<void>, onSuccess?: () => void): void {
    this.accionEnCurso.set(true);
    this.errorAccion.set(null);

    accion.subscribe({
      next: () => {
        this.accionEnCurso.set(false);
        onSuccess?.();
        this.cargar();
      },
      error: (err) => {
        this.accionEnCurso.set(false);
        this.errorAccion.set(err?.error?.detail ?? 'Ocurrió un error al ejecutar la acción.');
      }
    });
  }
}
