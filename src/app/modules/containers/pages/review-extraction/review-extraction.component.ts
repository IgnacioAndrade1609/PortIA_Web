import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ChipComponent],
  templateUrl: './review-extraction.component.html',
  styleUrl: './review-extraction.component.css'
})
export class ReviewExtractionComponent {
  private readonly documentService = inject(DocumentService);

  readonly pendientes = this.documentService.pendientesDeRevision;
  readonly borradores = signal<Record<number, DatosExtraidos>>({});

  datosForm(idDocumento: number, original: DatosExtraidos): DatosExtraidos {
    return this.borradores()[idDocumento] ?? original;
  }

  actualizarCampo<K extends keyof DatosExtraidos>(idDocumento: number, original: DatosExtraidos, campo: K, valor: DatosExtraidos[K]): void {
    const actual = this.datosForm(idDocumento, original);
    this.borradores.update(b => ({ ...b, [idDocumento]: { ...actual, [campo]: valor } }));
  }

  confirmar(idDocumento: number): void {
    this.documentService.confirmar(idDocumento);
  }

  colorConfianza(confidence: number): ChipColor {
    if (confidence < 0.5) return 'danger';
    if (confidence < 0.7) return 'warning';
    return 'success';
  }
}
