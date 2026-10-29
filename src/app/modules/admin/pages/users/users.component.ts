import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RoleDto, UserDto } from '../../../../shared/models/usuario.model';
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
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  readonly usuarios = signal<UserDto[]>([]);
  readonly roles = signal<RoleDto[]>([]);
  readonly columnas = ['nombreUsuario', 'email', 'rol', 'vigente'];

  readonly mostrandoFormulario = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombreUsuario: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rolId: this.fb.control<number | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.guardando.set(true);
    const { nombreUsuario, email, password, rolId } = this.form.getRawValue();

    this.userService.create({ nombreUsuario, email, password, rolId: rolId! }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrandoFormulario.set(false);
        this.form.reset({ nombreUsuario: '', email: '', password: '', rolId: null });
        this.cargarUsuarios();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(err.status === 409 ? 'Ya existe un usuario con ese correo.' : 'No se pudo crear el usuario.');
      }
    });
  }

  alternarVigencia(usuario: UserDto): void {
    this.userService.updateStatus(usuario.id, !usuario.active).subscribe({
      next: () => this.cargarUsuarios(),
      error: () => this.error.set('No se pudo actualizar el estado del usuario.')
    });
  }

  private cargarUsuarios(): void {
    this.userService.getUsers().subscribe({
      next: resultado => this.usuarios.set(resultado.items),
      error: () => this.error.set('No se pudieron cargar los usuarios.')
    });
  }

  private cargarRoles(): void {
    this.userService.getRoles().subscribe({
      next: roles => this.roles.set(roles)
    });
  }
}
