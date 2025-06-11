import { TipoCocina } from './enums/tipo-cocina.enum';
import { Barrio } from './enums/barrio.enum';
import { RangoPrecio } from './enums/rango-precio.enum';
import { RestriccionDietetica } from './enums/restriccion-dietetica.enum';
import { Usuario } from './usuario.model';
import { Resenya } from './resenya.model';

export interface Restaurante {
  id?: number;

  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  password?: string; // Solo se usa en el registro

  tipoCocina: TipoCocina;
  tipoCocinaPersonalizado?: string;

  barrio: Barrio;
  rangoPrecio: RangoPrecio;
  restriccionesDieteticas: RestriccionDietetica[];

  usuario?: Usuario; // Puede ser null en carga inicial, pero necesario en backend

  resenyas?: Resenya[];
  mediaPuntuacion?: number;
  descripcion?: string;
  rutaMenu?: string; // Ruta al menú del restaurante
  solicitaBaja?: boolean; // Indica si el restaurante ha solicitado la baja
}
