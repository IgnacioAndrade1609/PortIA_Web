import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { UploadService } from './upload.service';

type EstadoCargaUi = 'IDLE' | 'SUBIENDO' | 'EXTRAYENDO' | 'COMPLETO' | 'ERROR';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, RouterLink],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  private uploadService = inject(UploadService);

  readonly estado = signal<EstadoCargaUi>('IDLE');
  readonly progreso = signal(0);
  readonly nombreArchivo = signal<string | null>(null);
  readonly arrastrando = signal(false);
  readonly error = signal<string | null>(null);

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
    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) this.procesar(archivo);
  }

  onFileSelected(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (archivo) this.procesar(archivo);
  }

  private procesar(archivo: File): void {
    this.error.set(null);
  
    const tiposPermitidos = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!tiposPermitidos.includes(archivo.type)) {
      this.error.set('Formato no permitido. Solo se aceptan archivos PDF, PNG o JPG (415).');
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      this.error.set('El archivo supera los 10 MB permitidos (413).');
      return;
    }

    this.nombreArchivo.set(archivo.name);
    this.estado.set('SUBIENDO');
    this.progreso.set(0);

    // Llamada real al backend
    this.uploadService.uploadFile(archivo).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          this.progreso.set(percentDone);
          
          if (percentDone >= 100) {
            this.estado.set('EXTRAYENDO'); // Cambia a extrayendo una vez completada la subida
          }
        } else if (event.type === HttpEventType.Response) {
          this.estado.set('COMPLETO');
        }
      },
      error: (err) => {
        this.estado.set('IDLE');
        this.error.set(err?.error?.message || 'Ocurrió un error al subir el documento.');
      }
    });
  }

  reiniciar(): void {
    this.estado.set('IDLE');
    this.progreso.set(0);
    this.nombreArchivo.set(null);
    this.error.set(null);
  }
}