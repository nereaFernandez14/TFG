import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AutenticacionService } from "../services/autenticacion.service";

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AutenticacionService, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.obtenerUsuario();
    if (user?.rol === 'ADMIN') {
      return true;
    }
    this.router.navigate(['/home']);
    return false;
  }
}
