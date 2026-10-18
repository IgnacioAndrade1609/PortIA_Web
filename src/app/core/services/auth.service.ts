import { Injectable, computed, signal } from '@angular/core';
import { MOCK_CREDENTIALS } from '../../shared/mocks/usuarios.mock';
import { LoginResponse, RolUsuario, Usuario } from '../../shared/models/usuario.model';

const STORAGE_KEY = 'portia_mock_session';

interface Session {
  token: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<Session | null>(this.restoreSession());

  readonly usuario = computed(() => this.sessionSignal()?.usuario ?? null);
  readonly rol = computed<RolUsuario | null>(() => this.sessionSignal()?.usuario.rol ?? null);
  readonly isLoggedIn = computed(() => this.sessionSignal() !== null);

  login(email: string, password: string): LoginResponse | null {
    const credencial = MOCK_CREDENTIALS.find(
      c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
    );
    if (!credencial) return null;

    const token = `mock.${btoa(credencial.usuario.email)}.${Date.now()}`;
    const session: Session = { token, usuario: credencial.usuario };
    this.sessionSignal.set(session);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return {
      token,
      nombreUsuario: credencial.usuario.nombreUsuario,
      rol: credencial.usuario.rol,
      expiraEn: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    };
  }

  logout(): void {
    this.sessionSignal.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  defaultRouteForRole(rol: RolUsuario): string {
    switch (rol) {
      case 'Analista': return '/dashboard';
      case 'Jefe': return '/equipo/dashboard';
      case 'Admin': return '/admin/dashboard-global';
    }
  }

  private restoreSession(): Session | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
