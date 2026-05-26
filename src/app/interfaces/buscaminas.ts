export interface Celda {
  fila: number;
  columna: number;
  tieneMina: boolean;
  revelada: boolean;
  marcada: boolean; // para poner la banderita con click derecho
  minasAlrededor: number;
}