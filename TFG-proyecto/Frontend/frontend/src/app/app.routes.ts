// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HeaderComponent } from './header/header.component';
import { AdminPanelComponent } from './admin-panel/admin-panel-component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { RedirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';
import { RestauranteComponent } from './restaurante/restaurante.component';
import { redirectRestauranteGuard } from './guards/redirect-restaurante.guard';
import { MisResenyasComponent } from './mis-resenyas/mis-resenyas.component';
import { AdminGuard } from './guards/admin.guard';
import { redirectAdminGuard } from './guards/redirectAdminGuard';


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
    component: HomeComponent,
    canActivate: [redirectRestauranteGuard, redirectAdminGuard]
  },
  {
    path: 'admin-panel',
    loadComponent: () => import('./admin-panel/admin-panel-component').then(m => m.AdminPanelComponent),
    canActivate: [AdminGuard] 
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
  {
    path: 'comentarios',
    loadComponent: () =>
      import('./mis-resenyas/mis-resenyas.component').then(m => m.MisResenyasComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { rol: 'RESTAURANTE' }
  },
  {
    path: 'menu/modificar',
    loadComponent: () =>
      import('./modificar-menu/modificar-menu.component').then(m => m.ModificarMenuComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { rol: 'RESTAURANTE' }
  },

  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
