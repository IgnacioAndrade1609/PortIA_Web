import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpEventType } from '@angular/common/http';
import { UploadService, UploadedDocumentResult } from './upload.service';

type EstadoCargaUi = 'IDLE' | 'SUBIENDO' | 'EXTRAYENDO' | 'COMPLETO' | 'ERROR';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  private uploadService = inject(UploadService);
  private dialogRef = inject(MatDialogRef<UploadComponent>, { optional: true });

  readonly estado = signal<EstadoCargaUi>('IDLE');
  readonly progreso = signal(0);
  readonly nombresArchivos = signal<string[]>([]);
  readonly arrastrando = signal(false);
  readonly error = signal<string | null>(null);
  readonly resultados = signal<UploadedDocumentResult[]>([]);

  private static readonly TiposPermitidos = ['application/pdf', 'image/png', 'image/jpeg'];
  private static readonly TamanoMaximoBytes = 10 * 1024 * 1024;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(true);
  }

  onDragLeave(): void {
    this.arrastrando.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const archivos = event.dataTransfer?.files;
    if (archivos?.length) this.procesar(Array.from(archivos));
  }

  onFileSelected(event: Event): void {
    const archivos = (event.target as HTMLInputElement).files;
    if (archivos?.length) this.procesar(Array.from(archivos));
  }

  private procesar(archivos: File[]): void {
    this.error.set(null);

    const archivoInvalido = archivos.find(a => !UploadComponent.TiposPermitidos.includes(a.type));
    if (archivoInvalido) {
      this.error.set(`"${archivoInvalido.name}": formato no permitido. Solo se aceptan PDF, PNG o JPG (415).`);
      return;
    }

    const archivoMuyGrande = archivos.find(a => a.size > UploadComponent.TamanoMaximoBytes);
    if (archivoMuyGrande) {
      this.error.set(`"${archivoMuyGrande.name}" supera los 10 MB permitidos (413).`);
      return;
    }

    this.nombresArchivos.set(archivos.map(a => a.name));
    this.estado.set('SUBIENDO');
    this.progreso.set(0);

    this.uploadService.uploadFiles(archivos).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          this.progreso.set(percentDone);

          if (percentDone >= 100) {
            this.estado.set('EXTRAYENDO');
          }
        } else if (event.type === HttpEventType.Response) {
          this.resultados.set(event.body?.documents ?? []);
          this.estado.set('COMPLETO');
        }
      },
      error: (err) => {
        this.estado.set('IDLE');
        this.error.set(err?.error?.detail || err?.error?.message || 'Ocurrió un error al subir los documentos.');
      }
    });
  }

  reiniciar(): void {
    this.estado.set('IDLE');
    this.progreso.set(0);
    this.nombresArchivos.set([]);
    this.resultados.set([]);
    this.error.set(null);
  }

  cerrar(): void {
    this.dialogRef?.close(this.estado() === 'COMPLETO');
  }
}
