import { Component, inject, input, numberAttribute, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChipComponent } from '../../../../shared/components/chip/chip.component';
import { NotificationDetail } from '../../../../shared/models/notificacion.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, ChipComponent],
  templateUrl: './email-detail.component.html',
  styleUrl: './email-detail.component.css'
})
export class EmailDetailComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Recibe la ID de alerta desde la ruta
  readonly id = input.required({ transform: numberAttribute });

  // Recibe el canalId desde los query params (?canalId=1 o ?canalId=2)
  readonly canalId = input<number, unknown>(1, { transform: (v) => Number(v) || 1 });

  readonly detalle = signal<NotificationDetail | null>(null);
  readonly enviando = signal(false);

  asunto = '';
  contenido = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.notificationService.obtenerDetalle(this.id(), this.canalId()).subscribe({
      next: (datos) => {
        this.detalle.set(datos);
        this.asunto = datos.asunto ?? '';
        this.contenido = datos.mensaje ?? '';
      },
      error: (err) => {
        console.error('Error al cargar detalle de la notificación:', err);
        this.snackBar.open('No se pudo cargar la notificación solicitada.', 'Cerrar', { duration: 4000 });
      }
    });
  }

  get valido(): boolean {
    return this.contenido.trim().length > 0;
  }

  cancelar(): void {
    this.volver();
  }

  enviar(): void {
    const det = this.detalle();
    if (!det || this.enviando()) return;

    this.enviando.set(true);

    this.notificationService.enviar(this.id(), {
      canalId: det.tipoCanal,
      mensaje: this.contenido,
      destinatario: det.destinatario,
      asunto: this.asunto
    }).subscribe({
      next: () => {
        this.snackBar.open(`Notificación enviada por ${det.nombreCanal} con éxito`, 'Cerrar', { duration: 3500 });
        this.enviando.set(false);
        this.volver();
      },
      error: (err) => {
        console.error('Error al enviar la notificación:', err);
        const mensajeError = err?.error?.detail || 'Ocurrió un error al enviar el mensaje.';
        this.snackBar.open(mensajeError, 'Cerrar', { duration: 5000 });
        this.enviando.set(false);
      }
    });
  }

  private volver(): void {
    this.router.navigate(['/aprobacion-correo']);
  }
}