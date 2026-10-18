import { Component, computed, inject } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AuditService } from '../../../../shared/services/audit.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-audit',
  standalone: true,
  imports: [DatePipe, JsonPipe, MatTableModule],
  templateUrl: './my-audit.component.html'
})
export class MyAuditComponent {
  private readonly auditService = inject(AuditService);
  private readonly auth = inject(AuthService);

  readonly columnas = ['createAt', 'nombreEntidad', 'accion', 'valoresAnteriores', 'valoresNuevos'];

  readonly logs = computed(() => {
    const nombre = this.auth.usuario()?.nombreUsuario;
    return this.auditService.logs().filter(log => log.responsable === nombre);
  });
}
