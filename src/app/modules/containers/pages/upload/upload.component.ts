import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';

type EstadoCargaUi = 'IDLE' | 'SUBIENDO' | 'EXTRAYENDO' | 'COMPLETO' | 'ERROR';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, RouterLink],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
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

    if (archivo.type !== 'application/pdf') {
      this.error.set('Formato no permitido. Solo se aceptan archivos PDF (415).');
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      this.error.set('El archivo supera los 10 MB permitidos (413).');
      return;
    }

    this.nombreArchivo.set(archivo.name);
    this.estado.set('SUBIENDO');
    this.progreso.set(0);
    this.simularProgreso();
  }

  private simularProgreso(): void {
    const intervalo = setInterval(() => {
      this.progreso.update(p => Math.min(p + 10, 100));

      if (this.progreso() >= 40 && this.estado() === 'SUBIENDO') {
        this.estado.set('EXTRAYENDO');
      }

      if (this.progreso() >= 100) {
        clearInterval(intervalo);
        this.estado.set('COMPLETO');
      }
    }, 300);
  }

  reiniciar(): void {
    this.estado.set('IDLE');
    this.progreso.set(0);
    this.nombreArchivo.set(null);
    this.error.set(null);
  }
}
