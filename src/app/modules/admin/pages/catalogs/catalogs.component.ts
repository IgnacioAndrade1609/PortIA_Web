import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../../../../shared/services/catalog.service';

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
export class CatalogsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly catalogService = inject(CatalogService);

  readonly navieras = this.catalogService.navieras;
  readonly terminales = this.catalogService.terminales;

  readonly columnasNaviera = ['nombreNaviera', 'codigoNaviera', 'vigente'];
  readonly columnasTerminal = ['codigoTerminal', 'nombreTerminal', 'pais', 'vigente'];

  readonly mostrandoFormNaviera = signal(false);

  readonly formNaviera = this.fb.nonNullable.group({
    nombreNaviera: ['', Validators.required],
    codigoNaviera: ['', Validators.required]
  });

  crearNaviera(): void {
    if (this.formNaviera.invalid) {
      this.formNaviera.markAllAsTouched();
      return;
    }
    const { nombreNaviera, codigoNaviera } = this.formNaviera.getRawValue();
    this.catalogService.crearNaviera(nombreNaviera, codigoNaviera);
    this.formNaviera.reset({ nombreNaviera: '', codigoNaviera: '' });
    this.mostrandoFormNaviera.set(false);
  }

  alternarVigenciaNaviera(id: number): void {
    this.catalogService.alternarVigenciaNaviera(id);
  }

  alternarVigenciaTerminal(id: number): void {
    this.catalogService.alternarVigenciaTerminal(id);
  }
}
