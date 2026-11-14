import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { Naviera } from '../../../../shared/models/catalogo.model';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './catalogs.component.html'
})
export class CatalogsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);

  readonly navieras = this.catalogService.navieras;
  readonly terminales = this.catalogService.terminales;

  readonly columnasNaviera = ['nombreNaviera', 'codigoNaviera', 'email', 'telefono', 'vigente', 'acciones'];
  readonly columnasTerminal = ['codigoTerminal', 'nombreTerminal', 'pais', 'vigente'];

  readonly mostrandoFormNaviera = signal(false);
  readonly navieraEditandoId = signal<number | null>(null);
  readonly guardando = signal(false);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  readonly formNaviera = this.fb.nonNullable.group({
    nombreNaviera: ['', [Validators.required, Validators.maxLength(150)]],
    codigoNaviera: ['', [Validators.maxLength(10)]],
    email: ['', [Validators.email, Validators.maxLength(250)]],
    telefono: ['', [Validators.maxLength(50)]]
  });

  ngOnInit(): void {
    this.cargarNavieras();
  }

  cargarNavieras(): void {
    this.cargando.set(true);
    this.catalogService.cargarNavieras().subscribe({
      next: () => this.cargando.set(false),
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar las navieras.');
      }
    });
  }

  alternarFormulario(): void {
    if (this.mostrandoFormNaviera()) {
      this.cerrarFormulario();
      return;
    }
    this.navieraEditandoId.set(null);
    this.formNaviera.reset({ nombreNaviera: '', codigoNaviera: '', email: '', telefono: '' });
    this.error.set(null);
    this.mostrandoFormNaviera.set(true);
  }

  editarNaviera(naviera: Naviera): void {
    this.navieraEditandoId.set(naviera.id);
    this.formNaviera.reset({
      nombreNaviera: naviera.nombreNaviera,
      codigoNaviera: naviera.codigoNaviera ?? '',
      email: naviera.email ?? '',
      telefono: naviera.telefono ?? ''
    });
    this.error.set(null);
    this.mostrandoFormNaviera.set(true);
  }

  guardarNaviera(): void {
    if (this.formNaviera.invalid) {
      this.formNaviera.markAllAsTouched();
      return;
    }

    const valores = this.formNaviera.getRawValue();
    const request = {
      nombreNaviera: valores.nombreNaviera.trim(),
      codigoNaviera: valores.codigoNaviera.trim() || null,
      email: valores.email.trim() || null,
      telefono: valores.telefono.trim() || null
    };

    const id = this.navieraEditandoId();
    const operacion = id === null
      ? this.catalogService.crearNaviera(request)
      : this.catalogService.actualizarNaviera(id, request);

    this.guardando.set(true);
    this.error.set(null);
    operacion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarFormulario();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(this.mensajeDeError(err, id === null ? 'No se pudo crear la naviera.' : 'No se pudo actualizar la naviera.'));
      }
    });
  }

  alternarVigenciaNaviera(naviera: Naviera, cambio: MatSlideToggleChange): void {
    this.error.set(null);
    this.catalogService.cambiarVigenciaNaviera(naviera.id, cambio.checked).subscribe({
      error: (err: HttpErrorResponse) => {
        cambio.source.checked = naviera.vigente;
        this.error.set(this.mensajeDeError(err, 'No se pudo actualizar la vigencia de la naviera.'));
      }
    });
  }

  alternarVigenciaTerminal(id: number): void {
    this.catalogService.alternarVigenciaTerminal(id);
  }

  private cerrarFormulario(): void {
    this.mostrandoFormNaviera.set(false);
    this.navieraEditandoId.set(null);
    this.formNaviera.reset({ nombreNaviera: '', codigoNaviera: '', email: '', telefono: '' });
  }

  private mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 409 || err.status === 400) {
      const detalle = err.error?.detail ?? err.error?.message;
      if (typeof detalle === 'string' && detalle.length > 0) return detalle;
      if (err.status === 409) return 'Ya existe una naviera con ese nombre o código.';
    }
    if (err.status === 403) return 'No tienes permisos para modificar navieras.';
    return porDefecto;
  }
}
