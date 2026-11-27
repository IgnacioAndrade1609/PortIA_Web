import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../../shared/models/usuario.model';

export function roleGuard(rolesPermitidos: RolUsuario[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.rol();

    if (!rol) return router.createUrlTree(['/login']);
    if (rolesPermitidos.includes(rol)) return true;

    return router.createUrlTree([auth.defaultRouteForRole(rol)]);
  };
}
