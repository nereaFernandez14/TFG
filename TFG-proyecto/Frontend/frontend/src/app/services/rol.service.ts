import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RolService {
  private apiUrl = '/api/roles';

  constructor(private http: HttpClient) {}

  obtenerRoles(): Observable<{ id: number, nombre: string }[]> {
    return this.http.get<{ id: number, nombre: string }[]>(this.apiUrl, {
      withCredentials: true
    });
  }
}
