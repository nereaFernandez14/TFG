// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './header/header.component';
import { AdminComponent } from './Admin/admin.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { RedirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';
import { SobreNosotrosComponent } from './sobre-nosotros/sobre-nosotros.component';
import { RestauranteComponent } from './restaurante/restaurante.component';

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
    path: 'sobre-nosotros',
    component: SobreNosotrosComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { rol: 'admin' }
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [AuthGuard]
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
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { rol: 'RESTAURANTE' }
  },
  {
    path: 'resenyas/nueva',
    loadComponent: () =>
      import('./resenya/resenya.component').then((m) => m.ResenyaComponent),
    canActivate: [AuthGuard],
    data: { rol: 'USUARIO' }
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
