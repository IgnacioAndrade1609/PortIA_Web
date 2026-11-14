import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { AuditService } from '../../../../shared/services/audit.service';
import { LogAuditoria } from '../../../../shared/models/auditoria.model';

@Component({
  selector: 'app-my-audit',
  standalone: true,
  imports: [DatePipe, MatTableModule],
  templateUrl: './my-audit.component.html'
})
export class MyAuditComponent implements OnInit {
  private readonly auditService = inject(AuditService);

  readonly columnas = ['createAt', 'nombreEntidad', 'accion', 'valoresAnteriores', 'valoresNuevos'];
  readonly logs = signal<LogAuditoria[]>([]);

  ngOnInit(): void {
    this.auditService.getLogs({ pageSize: 100 }).subscribe({
      next: resultado => this.logs.set(resultado.items)
    });
  }
}
