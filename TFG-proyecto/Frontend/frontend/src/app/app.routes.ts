// src/app/routes.ts
import { Routes } from '@angular/router';
import { RedirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    canActivate: [RedirectIfAuthenticatedGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    canActivate: [RedirectIfAuthenticatedGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'admin',
        loadComponent: () => import('./Admin/admin.component').then(m => m.AdminComponent),
        canActivate: [RoleGuard],
        data: { rol: 'admin' }
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'change-password',
        loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'restaurantes/crear',
        loadComponent: () => import('./restaurante/restaurante.component').then(m => m.RestauranteComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { rol: 'RESTAURANTE' }
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { rol: 'RESTAURANTE' }
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
