import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ChipColor, ChipComponent } from '../../../../shared/components/chip/chip.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-email-approval',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, ChipComponent],
  templateUrl: './email-approval.component.html',
  styleUrl: './email-approval.component.css'
})
export class EmailApprovalComponent {
  private readonly notificationService = inject(NotificationService);

  readonly borradores = this.notificationService.borradores;

  actualizar(idAlerta: number, asunto: string, contenido: string): void {
    this.notificationService.actualizarContenido(idAlerta, asunto, contenido);
  }

  aprobar(idAlerta: number): void {
    this.notificationService.aprobar(idAlerta);
  }

  rechazar(idAlerta: number): void {
    this.notificationService.rechazar(idAlerta);
  }

  colorEstado(estado: string): ChipColor {
    if (estado === 'RECHAZADA') return 'danger';
    if (estado === 'PENDIENTE_APROBACION') return 'warning';
    return 'success';
  }
}
