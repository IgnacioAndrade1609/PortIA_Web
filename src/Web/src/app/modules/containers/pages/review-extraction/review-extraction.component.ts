import { Component, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChipColor, ChipComponent } from '../../../../shared/components/chip/chip.component';
import { DatosExtraidos } from '../../../../shared/models/documento.model';
import { DocumentService } from '../../../../shared/services/document.service';

@Component({
  selector: 'app-review-extraction',
  standalone: true,
  imports: [SlicePipe, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ChipComponent],
  templateUrl: './review-extraction.component.html',
  styleUrl: './review-extraction.component.css'
})
export class ReviewExtractionComponent {
  private readonly documentService = inject(DocumentService);
  private readonly router = inject(Router);

  readonly pendientes = this.documentService.pendientesDeRevision;
  readonly borradores = signal<Record<number, DatosExtraidos>>({});
  readonly errores = signal<Record<number, string>>({});
  readonly enviando = signal<number | null>(null);

  constructor() {
    this.documentService.cargarPendientes();
  }

  datosForm(idDocumento: number, original: DatosExtraidos): DatosExtraidos {
    return this.borradores()[idDocumento] ?? original;
  }

  actualizarCampo<K extends keyof DatosExtraidos>(idDocumento: number, original: DatosExtraidos, campo: K, valor: DatosExtraidos[K]): void {
    const actual = this.datosForm(idDocumento, original);
    this.borradores.update(b => ({ ...b, [idDocumento]: { ...actual, [campo]: valor } }));
    this.errores.update(e => {
      const { [idDocumento]: _omitido, ...resto } = e;
      return resto;
    });
  }

  confirmar(idDocumento: number, original: DatosExtraidos): void {
    const datos = this.datosForm(idDocumento, original);
    this.enviando.set(idDocumento);

    this.documentService.confirmar(idDocumento, datos).subscribe({
      next: (resultado) => {
        this.enviando.set(null);
        this.router.navigate(['/contenedores', resultado.containerId]);
      },
      error: (err) => {
        this.enviando.set(null);
        const mensaje = err?.error?.errors?.['ContainerNumber']?.[0]
          ?? err?.error?.detail
          ?? 'No se pudo validar el documento.';
        this.errores.update(e => ({ ...e, [idDocumento]: mensaje }));
      }
    });
  }

  colorConfianza(confidence: number | null): ChipColor {
    if (confidence === null) return 'secondary';
    if (confidence < 0.5) return 'danger';
    if (confidence < 0.7) return 'warning';
    return 'success';
  }
}
