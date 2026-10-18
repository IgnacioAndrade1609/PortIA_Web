import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);

  readonly usuario = this.auth.usuario;
  readonly rol = this.auth.rol;
  readonly tema = this.themeService.tema;

  readonly navItems = computed<NavItem[]>(() => {
    switch (this.rol()) {
      case 'Analista':
        return [
          { path: '/dashboard', label: 'Mis contenedores', icon: 'dashboard' },
          { path: '/contenedores/carga', label: 'Cargar documento', icon: 'upload_file' },
          { path: '/contenedores/revision', label: 'Revisión', icon: 'fact_check' },
          { path: '/alertas', label: 'Alertas', icon: 'notifications' },
          { path: '/aprobacion-correo', label: 'Aprobación de correo', icon: 'mail' },
          { path: '/auditoria/mia', label: 'Mi historial', icon: 'history' }
        ];
      case 'Jefe':
        return [
          { path: '/equipo/dashboard', label: 'Dashboard de equipo', icon: 'groups' },
          { path: '/equipo/gestion', label: 'Panel de gestión', icon: 'bar_chart' },
          { path: '/alertas', label: 'Alertas del equipo', icon: 'notifications' }
        ];
      case 'Admin':
        return [
          { path: '/admin/dashboard-global', label: 'Dashboard global', icon: 'public' },
          { path: '/equipo/dashboard', label: 'Dashboard de equipo', icon: 'groups' },
          { path: '/equipo/gestion', label: 'Panel de gestión', icon: 'bar_chart' },
          { path: '/alertas', label: 'Alertas', icon: 'notifications' },
          { path: '/admin/usuarios', label: 'Usuarios', icon: 'manage_accounts' },
          { path: '/admin/catalogos', label: 'Navieras y terminales', icon: 'warehouse' },
          { path: '/admin/auditoria', label: 'Auditoría', icon: 'fact_check' }
        ];
      default:
        return [];
    }
  });

  alternarTema(): void {
    this.themeService.alternar();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
