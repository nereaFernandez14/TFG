// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, Routes, withRouterConfig } from '@angular/router';
import {
  HttpClientModule,
  HttpClientXsrfModule
} from '@angular/common/http'; // 👈 incluimos XsrfModule

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { AdminComponent } from './Admin/admin.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { RegisterComponent } from './register/register.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { RedirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const routes: Routes = [
  { path: 'header', component: HeaderComponent },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [RedirectIfAuthenticatedGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [RedirectIfAuthenticatedGuard]
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { rol: 'admin' }
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./change-password/change-password.component').then(
        (m) => m.ChangePasswordComponent
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'restaurantes/crear',
    loadComponent: () =>
      import('./restaurante/restaurante.component').then(m => m.RestauranteComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { rol: 'RESTAURANTE' }
  },
  {
    path: 'restaurantes/:id',
    loadComponent: () =>
      import('./restaurante-perfil/restaurante-perfil.component').then((m) => m.RestaurantePerfilComponent)
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    importProvidersFrom(
      HttpClientModule,
      HttpClientXsrfModule.withOptions({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN'
      }) // 👈 activamos protección CSRF para Angular
    )
  ]
};
