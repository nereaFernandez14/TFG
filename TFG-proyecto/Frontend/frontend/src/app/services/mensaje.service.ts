import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private readonly API_URL = '/api/mensajes'; 

  constructor(private http: HttpClient) {}

  obtenerMensajes(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL, {
      withCredentials: true
    });
  }
}