import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  peticiones: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPeticiones();
  }

  cargarPeticiones() {
    this.http.get<any[]>('/admin/peticiones/pendientes').subscribe(data => {
      this.peticiones = data;
    });
  }

  aprobar(id: number) {
    this.http.put(`/admin/peticiones/${id}/aprobar`, {}).subscribe(() => {
      this.cargarPeticiones();
    });
  }

  rechazar(id: number) {
    this.http.put(`/admin/peticiones/${id}/rechazar`, {}).subscribe(() => {
      this.cargarPeticiones();
    });
  }
}
