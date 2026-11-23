import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginApiResponse, RolUsuario, Usuario } from '../../shared/models/usuario.model';

const STORAGE_KEY = 'portia_session';

interface Session {
  token: string;
  expiresAt: string;
  usuario: Usuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly sessionSignal = signal<Session | null>(this.restoreSession());

  readonly usuario = computed(() => this.sessionSignal()?.usuario ?? null);
  readonly rol = computed<RolUsuario | null>(() => this.sessionSignal()?.usuario.rol ?? null);
  readonly token = computed(() => this.sessionSignal()?.token ?? null);
  readonly isLoggedIn = computed(() => this.sessionSignal() !== null);

  login(email: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => this.setSession(response))
    );
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

  private setSession(response: LoginApiResponse): void {
    const session: Session = {
      token: response.token,
      expiresAt: response.expiresAt,
      usuario: {
        id: response.usuarioId,
        nombreUsuario: response.nombreUsuario,
        email: response.email,
        rol: response.rol
      }
    };
    this.sessionSignal.set(session);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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
