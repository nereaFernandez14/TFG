import { Usuario } from './usuario.model';
import { Restaurante } from './restaurante.model';

export interface Resenya {
  id?: number; // opcional al crear
  contenido: string;
  valoracion: number; // entre 1 y 5
  autor: Usuario;
  restaurante: Restaurante;
}
