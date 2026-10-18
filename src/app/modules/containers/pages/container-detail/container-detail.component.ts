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
import { FormsModule } from '@angular/forms';
import { RiskBadgeComponent } from '../../../../shared/components/risk-badge/risk-badge.component';
import { ContainerService } from '../../../../shared/services/container.service';
import { AuthService } from '../../../../core/services/auth.service';

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

  readonly detalle = signal(this.containerService.getById(this.id));
  readonly puedeEditarDiasLibres = computed(() => this.auth.rol() === 'Analista');

  readonly editando = signal(false);
  readonly diasDemurrageForm = signal(0);
  readonly diasDetentionForm = signal(0);

  iniciarEdicion(): void {
    const actual = this.detalle();
    if (!actual) return;
    this.diasDemurrageForm.set(actual.diasLibresDemurrage);
    this.diasDetentionForm.set(actual.diasLibresDetention);
    this.editando.set(true);
  }

  guardarDiasLibres(): void {
    const actualizado = this.containerService.updateFreeDays(
      this.id,
      this.diasDemurrageForm(),
      this.diasDetentionForm()
    );
    if (actualizado) this.detalle.set(actualizado);
    this.editando.set(false);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
  }
}
