import { Component, inject, input, numberAttribute, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChipComponent } from '../../../../shared/components/chip/chip.component';
import { BorradorCorreo } from '../../../../shared/models/notificacion.model';
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

  readonly id = input.required({ transform: numberAttribute });

  readonly borrador = signal<BorradorCorreo | undefined>(undefined);
  asunto = '';
  contenido = '';

  ngOnInit(): void {
    const borrador = this.notificationService.obtenerPorId(this.id());
    this.borrador.set(borrador);
    this.asunto = borrador?.asunto ?? '';
    this.contenido = borrador?.contenido ?? '';
  }

  get editable(): boolean {
    return this.borrador()?.estado === 'PENDIENTE_APROBACION';
  }

  get valido(): boolean {
    return this.asunto.trim().length > 0 && this.contenido.trim().length > 0;
  }

  cancelar(): void {
    this.volver();
  }

  guardar(): void {
    this.notificationService.guardarBorrador(this.id(), this.asunto, this.contenido);
    this.snackBar.open('Borrador guardado', 'Cerrar', { duration: 3000 });
  }

  enviar(): void {
    this.notificationService.enviar(this.id(), this.asunto, this.contenido);
    this.snackBar.open('Correo enviado', 'Cerrar', { duration: 3000 });
    this.volver();
  }

  private volver(): void {
    this.router.navigate(['/aprobacion-correo']);
  }
}
