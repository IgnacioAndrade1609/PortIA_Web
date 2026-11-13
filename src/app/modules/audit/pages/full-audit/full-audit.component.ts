import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuditService } from '../../../../shared/services/audit.service';
import { LogAuditoria } from '../../../../shared/models/auditoria.model';

@Component({
  selector: 'app-full-audit',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatPaginatorModule
  ],
  templateUrl: './full-audit.component.html'
})
export class FullAuditComponent implements OnInit {
  private readonly auditService = inject(AuditService);
  private readonly fb = inject(FormBuilder);

  readonly columnas = ['createAt', 'nombreEntidad', 'accion', 'responsable', 'valoresAnteriores', 'valoresNuevos'];

  readonly logs = signal<LogAuditoria[]>([]);
  readonly totalItems = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);

  readonly filterForm = this.fb.nonNullable.group({
    nombreEntidad: [''],
    accion: this.fb.control<string | null>(null),
    fromDate: this.fb.control<Date | null>(null),
    toDate: this.fb.control<Date | null>(null)
  });

  ngOnInit(): void {
    this.cargar();
    this.filterForm.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.cargar();
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  limpiarFiltros(): void {
    this.filterForm.reset({ nombreEntidad: '', accion: null, fromDate: null, toDate: null });
  }

  private cargar(): void {
    const { nombreEntidad, accion, fromDate, toDate } = this.filterForm.getRawValue();

    this.auditService.getLogs({
      nombreEntidad: nombreEntidad || null,
      accion,
      fromDate: fromDate ? fromDate.toISOString() : null,
      toDate: toDate ? toDate.toISOString() : null,
      page: this.pageIndex() + 1,
      pageSize: this.pageSize()
    }).subscribe({
      next: resultado => {
        this.logs.set(resultado.items);
        this.totalItems.set(resultado.totalItems);
      }
    });
  }
}
