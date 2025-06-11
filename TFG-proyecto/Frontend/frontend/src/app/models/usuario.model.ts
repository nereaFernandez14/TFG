import { RolNombre } from './enums/RolNombre.enum';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: RolNombre;
  solicitaBaja?: boolean;

}
