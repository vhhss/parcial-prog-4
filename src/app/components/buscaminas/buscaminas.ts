import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Database, ref, push, set } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { Celda } from '../../interfaces/buscaminas';

@Component({
  selector: 'app-buscaminas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buscaminas.html',
  styleUrl: './buscaminas.css'
})

export class Buscaminas implements OnInit {
  // Inyección de servicios
  private db = inject(Database);
  public authService = inject(AuthService);

  // CONFIGURACIÓN DEL TABLERO (Grilla estándar de 8x8 con 10 minas)
  private filas = 8;
  private columnas = 8;
  private cantidadMinas = 10;

  // signals para manejar el estado del juego
  tablero = signal<Celda[][]>([]);
  juegoTerminado = signal<boolean>(false);
  resultado = signal<'VICTORIA' | 'DERROTA' | null>(null);
  celdasDespejadas = signal<number>(0);
  mensajeFeedback = signal<string>('Hacé clic en cualquier casillero para empezar a despejar el terreno.');
  claseFeedback = signal<string>('alert-info');

  ngOnInit(): void {
    this.iniciarJuego();
  }

  // Inicializa o reinicia todas las variables del juego
  iniciarJuego(): void {
    this.juegoTerminado.set(false);
    this.resultado.set(null);
    this.celdasDespejadas.set(0);
    this.mensajeFeedback.set('Terreno listo. ¡Cuidado dónde pisás!');
    this.claseFeedback.set('alert-info');

    this.generarTablero();
  }

  // Genera la matriz de celdas vacías y distribuye las minas aleatoriamente
  private generarTablero(): void {
    // 1. Crear grilla vacía
    const nuevaGrilla: Celda[][] = [];
    for (let f = 0; f < this.filas; f++) {
      const filaCeldas: Celda[] = [];
      for (let c = 0; c < this.columnas; c++) {
        filaCeldas.push({
          fila: f,
          columna: c,
          tieneMina: false,
          revelada: false,
          marcada: false,
          minasAlrededor: 0
        });
      }
      nuevaGrilla.push(filaCeldas);
    }

    // 2. Plantar las 10 minas en posiciones aleatorias
    let minasPlantadas = 0;
    while (minasPlantadas < this.cantidadMinas) {
      const fRandom = Math.floor(Math.random() * this.filas);
      const cRandom = Math.floor(Math.random() * this.columnas);

      if (!nuevaGrilla[fRandom][cRandom].tieneMina) {
        nuevaGrilla[fRandom][cRandom].tieneMina = true;
        minasPlantadas++;
      }
    }

    // 3. Calcular los números indicadores de minas adyacentes
    for (let f = 0; f < this.filas; f++) {
      for (let c = 0; c < this.columnas; c++) {
        if (!nuevaGrilla[f][c].tieneMina) {
          nuevaGrilla[f][c].minasAlrededor = this.contarMinasAdyacentes(nuevaGrilla, f, c);
        }
      }
    }

    this.tablero.set(nuevaGrilla);
  }

  // Cuenta cuántas minas rodean a una celda específica
  private contarMinasAdyacentes(grilla: Celda[][], fila: number, col: number): number {
    let contador = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const nuevaF = fila + i;
        const nuevaC = col + j;
        // verificamos que la celda vecina esté dentro de los límites de la matriz
        if (nuevaF >= 0 && nuevaF < this.filas && nuevaC >= 0 && nuevaC < this.columnas) {
          if (grilla[nuevaF][nuevaC].tieneMina) {
            contador++;
          }
        }
      }
    }
    return contador;
  }

  // Dispara el intento cuando el usuario hace click izquierdo sobre un casillero
  revelarCelda(fila: number, col: number): void {
    const grilla = this.tablero();
    const celda = grilla[fila][col];

    // si ya está revelada, marcada con bandera o el juego terminó, frenamos
    if (celda.revelada || celda.marcada || this.juegoTerminado()) return;

    celda.revelada = true;

    if (celda.tieneMina) {
      // fallo: Detonó una mina (Derrota)
      this.mensajeFeedback.set('💥 ¡BOOM! Detonaste una mina explosiva.');
      this.claseFeedback.set('alert-danger');
      this.revelarTodoElTablero();
      this.finalizarPartida('DERROTA');
    } else {
      // accierto: Sumamos celda despejada
      this.celdasDespejadas.update(c => c + 1);

      // algoritmo de expansión si la celda no tiene minas alrededor
      if (celda.minasAlrededor === 0) {
        this.expandirVacio(grilla, fila, col);
      }

      // actualizamos el estado del signal de la grilla
      this.tablero.set([...grilla]);

      // verifica si se despejaron todos los casilleros seguros (Victoria)
      const celdasTotalesSeguras = (this.filas * this.columnas) - this.cantidadMinas;
      if (this.calcularCeldasReveladas(grilla) === celdasTotalesSeguras) {
        this.mensajeFeedback.set('🎉 ¡Felicidades! Despejaste todo el campo sin explotar.');
        this.claseFeedback.set('alert-success');
        this.finalizarPartida('VICTORIA');
      }
    }
  }

  // Permite colocar o quitar banderitas con el click derecho para bloquear casilleros sospechosos
  marcarCelda(event: MouseEvent, fila: number, col: number): void {
    event.preventDefault(); // evita que se abra el menú contextual del navegador
    if (this.juegoTerminado()) return;

    const grilla = this.tablero();
    const celda = grilla[fila][col];

    if (!celda.revelada) {
      celda.marcada = !celda.marcada;
      this.tablero.set([...grilla]);
    }
  }

  // Revela recursivamente los vecinos vacíos adyacentes
  private expandirVacio(grilla: Celda[][], fila: number, col: number): void {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const nuevaF = fila + i;
        const nuevaC = col + j;

        if (nuevaF >= 0 && nuevaF < this.filas && nuevaC >= 0 && nuevaC < this.columnas) {
          const vecina = grilla[nuevaF][nuevaC];
          if (!vecina.revelada && !vecina.tieneMina && !vecina.marcada) {
            vecina.revelada = true;
            this.celdasDespejadas.update(c => c + 1);
            if (vecina.minasAlrededor === 0) {
              this.expandirVacio(grilla, nuevaF, nuevaC);
            }
          }
        }
      }
    }
  }

  private calcularCeldasReveladas(grilla: Celda[][]): number {
    let contador = 0;
    for (const fila of grilla) {
      for (const celda of fila) {
        if (celda.revelada && !celda.tieneMina) {
          contador++;
        }
      }
    }
    return contador;
  }

  private revelarTodoElTablero(): void {
    const grilla = this.tablero();
    for (const fila of grilla) {
      for (const celda of fila) {
        if (celda.tieneMina) {
          celda.revelada = true;
        }
      }
    }
    this.tablero.set([...grilla]);
  }

  private async finalizarPartida(estado: 'VICTORIA' | 'DERROTA'): Promise<void> {
    this.juegoTerminado.set(true);
    this.resultado.set(estado);

    // Guardar estadísticas en la db
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    try {
      const nuevoResultadoRef = push(ref(this.db, 'resultadosBuscaminas'));
      await set(nuevoResultadoRef, {
        uid: usuario.uid,
        usuario: usuario.nombre,
        correo: usuario.correo,
        resultado: estado,
        casillerosDespejados: this.celdasDespejadas(),
        fechaPartida: new Date().toISOString()
      });
      console.log('Resultado de Buscaminas guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
    }
  }
}