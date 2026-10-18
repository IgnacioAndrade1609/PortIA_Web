import { Component, inject } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AuditService } from '../../../../shared/services/audit.service';

@Component({
  selector: 'app-full-audit',
  standalone: true,
  imports: [DatePipe, JsonPipe, MatTableModule],
  templateUrl: './full-audit.component.html'
})
export class FullAuditComponent {
  private readonly auditService = inject(AuditService);

  readonly columnas = ['createAt', 'nombreEntidad', 'accion', 'responsable', 'valoresAnteriores', 'valoresNuevos'];
  readonly logs = this.auditService.logs;
}
