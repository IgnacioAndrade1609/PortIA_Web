import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['Analista'])],
        loadComponent: () =>
          import('./modules/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { breadcrumb: 'Mis contenedores' }
      },
      {
        path: 'contenedores/carga',
        canActivate: [roleGuard(['Analista'])],
        loadComponent: () =>
          import('./modules/containers/pages/upload/upload.component').then(m => m.UploadComponent),
        data: { breadcrumb: 'Cargar documento' }
      },
      {
        path: 'contenedores/revision',
        canActivate: [roleGuard(['Analista'])],
        loadComponent: () =>
          import('./modules/containers/pages/review-extraction/review-extraction.component').then(m => m.ReviewExtractionComponent),
        data: { breadcrumb: 'Revisión de extracción' }
      },
      {
        path: 'contenedores/:id',
        canActivate: [roleGuard(['Analista', 'Jefe', 'Admin'])],
        loadComponent: () =>
          import('./modules/containers/pages/container-detail/container-detail.component').then(m => m.ContainerDetailComponent),
        data: { breadcrumb: 'Detalle de contenedor' }
      },
      {
        path: 'alertas',
        canActivate: [roleGuard(['Analista', 'Jefe', 'Admin'])],
        loadComponent: () =>
          import('./modules/alerts/pages/alerts/alerts.component').then(m => m.AlertsComponent),
        data: { breadcrumb: 'Alertas' }
      },
      {
        path: 'aprobacion-correo',
        canActivate: [roleGuard(['Analista'])],
        loadComponent: () =>
          import('./modules/approval/pages/email-approval/email-approval.component').then(m => m.EmailApprovalComponent),
        data: { breadcrumb: 'Aprobación de correo' }
      },
      {
        path: 'auditoria/mia',
        canActivate: [roleGuard(['Analista'])],
        loadComponent: () =>
          import('./modules/audit/pages/my-audit/my-audit.component').then(m => m.MyAuditComponent),
        data: { breadcrumb: 'Mi historial' }
      },
      {
        path: 'equipo/dashboard',
        canActivate: [roleGuard(['Jefe', 'Admin'])],
        loadComponent: () =>
          import('./modules/team/pages/team-dashboard/team-dashboard.component').then(m => m.TeamDashboardComponent),
        data: { breadcrumb: 'Dashboard de equipo' }
      },
      {
        path: 'equipo/gestion',
        canActivate: [roleGuard(['Jefe', 'Admin'])],
        loadComponent: () =>
          import('./modules/team/pages/management-panel/management-panel.component').then(m => m.ManagementPanelComponent),
        data: { breadcrumb: 'Panel de gestión' }
      },
      {
        path: 'admin/dashboard-global',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./modules/admin/pages/global-dashboard/global-dashboard.component').then(m => m.GlobalDashboardComponent),
        data: { breadcrumb: 'Dashboard global' }
      },
      {
        path: 'admin/usuarios',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./modules/admin/pages/users/users.component').then(m => m.UsersComponent),
        data: { breadcrumb: 'Usuarios' }
      },
      {
        path: 'admin/catalogos',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./modules/admin/pages/catalogs/catalogs.component').then(m => m.CatalogsComponent),
        data: { breadcrumb: 'Navieras y terminales' }
      },
      {
        path: 'admin/auditoria',
        canActivate: [roleGuard(['Admin'])],
        loadComponent: () =>
          import('./modules/audit/pages/full-audit/full-audit.component').then(m => m.FullAuditComponent),
        data: { breadcrumb: 'Auditoría completa' }
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
