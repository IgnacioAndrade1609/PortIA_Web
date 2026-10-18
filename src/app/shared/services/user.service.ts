import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { MOCK_CREDENTIALS } from '../mocks/usuarios.mock';

export interface UsuarioAdmin extends Usuario {
  vigente: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usuariosSignal = signal<UsuarioAdmin[]>(
    MOCK_CREDENTIALS.map(c => ({ ...c.usuario, vigente: true }))
  );

  readonly usuarios = this.usuariosSignal.asReadonly();

  crear(nombreUsuario: string, email: string, rol: Usuario['rol']): void {
    this.usuariosSignal.update(lista => [
      ...lista,
      { id: Math.max(0, ...lista.map(u => u.id)) + 1, nombreUsuario, email, rol, vigente: true }
    ]);
  }

  alternarVigencia(id: number): void {
    this.usuariosSignal.update(lista =>
      lista.map(u => (u.id === id ? { ...u, vigente: !u.vigente } : u))
    );
  }
}
