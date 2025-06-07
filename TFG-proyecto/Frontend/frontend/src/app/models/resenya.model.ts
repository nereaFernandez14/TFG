import { Restaurante } from "./restaurante.model";
import { Usuario } from "./usuario.model";

export interface ImagenResenya {
  id: number;
  tipo: string; 
}

export interface Resenya {
  id?: number;
  contenido: string;
  valoracion: number;
  autor: Usuario;
  restaurante: Restaurante;
  imagenes?: ImagenResenya[]; // ✅
}
