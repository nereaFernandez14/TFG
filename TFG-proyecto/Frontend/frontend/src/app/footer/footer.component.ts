import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // 

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule], // 👈 NECESARIO PARA USAR routerLink
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {}
