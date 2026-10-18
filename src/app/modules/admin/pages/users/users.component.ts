import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RolUsuario } from '../../../../shared/models/usuario.model';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './users.component.html'
})
export class UsersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  readonly usuarios = this.userService.usuarios;
  readonly columnas = ['nombreUsuario', 'email', 'rol', 'vigente'];

  readonly mostrandoFormulario = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombreUsuario: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    rol: this.fb.nonNullable.control<RolUsuario>('Analista', Validators.required)
  });

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombreUsuario, email, rol } = this.form.getRawValue();
    this.userService.crear(nombreUsuario, email, rol);
    this.form.reset({ nombreUsuario: '', email: '', rol: 'Analista' });
    this.mostrandoFormulario.set(false);
  }

  alternarVigencia(id: number): void {
    this.userService.alternarVigencia(id);
  }
}
