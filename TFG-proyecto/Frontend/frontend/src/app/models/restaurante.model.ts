export interface Restaurante {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  password?: string;     // opcional si no lo usas en el frontend
  //usuario?: any;         // puedes definirlo mejor si tienes un modelo Usuario
  //resenyas?: any[];      // puedes tipar esto mejor también
}