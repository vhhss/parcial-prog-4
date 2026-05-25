import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Database, ref, push, set } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css'
})
export class Ahorcado implements OnInit, OnDestroy {
  // Inyección de servicios
  private db = inject(Database);
  public authService = inject(AuthService);

  // Lista de palabras posibles para el juego
  private bancoPalabras: string[] = [
    'ANGULAR', 'FIREBASE', 'UTN', 'TECNICATURA', 'PROGRAMACION', 
    'COMPONENTE', 'SEÑALES', 'FRONTEND', 'DATABASE', 'LOGICA'
  ];

  // signals para manejar el estado del juego
  palabraSecreta = signal<string>('');
  palabraOculta = signal<string[]>([]);
  intentosRestantes = signal<number>(6); // 6 vidas estándar
  letrasSeleccionadas = signal<string[]>([]);
  juegoTerminado = signal<boolean>(false);
  resultado = signal<'VICTORIA' | 'DERROTA' | null>(null);
  
  // Cronómetro
  tiempoSegundos = signal<number>(0);
  private intervaloCronometro: any;

  // Abecedario para generar los botones (Evita el uso del teclado físico)
  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

  ngOnInit(): void {
    this.iniciarJuego();
  }

  ngOnDestroy(): void {
    this.detenerCronometro();
  }

  // Inicializa o reinicia todas las variables del juego
  iniciarJuego(): void {
    // 1. Elegir palabra al azar
    const indiceRandom = Math.floor(Math.random() * this.bancoPalabras.length);
    const palabra = this.bancoPalabras[indiceRandom];
    
    this.palabraSecreta.set(palabra);
    // Llenamos el array oculto con guiones bajos
    this.palabraOculta.set(Array(palabra.length).fill('_'));
    
    // 2. Resetear estados
    this.intentosRestantes.set(6);
    this.letrasSeleccionadas.set([]);
    this.juegoTerminado.set(false);
    this.resultado.set(null);
    this.tiempoSegundos.set(0);

    // 3. Arrancar cronómetro
    this.detenerCronometro();
    this.iniciarCronometro();
  }

  // Dispara el intento cuando el usuario hace click en un botón de letra
  seleccionarLetra(letra: string): void {
    // si el juego ya terminó o la letra ya se usó, frenamos
    if (this.juegoTerminado() || this.letrasSeleccionadas().includes(letra)) return;

    // registra la letra seleccionada
    this.letrasSeleccionadas.update(letras => [...letras, letra]);

    const palabraTarget = this.palabraSecreta();
    
    if (palabraTarget.includes(letra)) {
      // accierto: Revelamos la letra en la palabra oculta
      const nuevaPalabraOculta = [...this.palabraOculta()];
      for (let i = 0; i < palabraTarget.length; i++) {
        if (palabraTarget[i] === letra) {
          nuevaPalabraOculta[i] = letra;
        }
      }
      this.palabraOculta.set(nuevaPalabraOculta);

      // verifica si descubrió toda la palabra (Victoria)
      if (!nuevaPalabraOculta.includes('_')) {
        this.finalizarPartida('VICTORIA');
      }
    } else {
      // fallo: Restamos una vida
      this.intentosRestantes.update(v => v - 1);

      // verifica si se quedó sin vidas (Derrota)
      if (this.intentosRestantes() === 0) {
        this.finalizarPartida('DERROTA');
      }
    }
  }

  private async finalizarPartida(estado: 'VICTORIA' | 'DERROTA'): Promise<void> {
    this.juegoTerminado.set(true);
    this.resultado.set(estado);
    this.detenerCronometro();

    // Guardar estadísticas en la db
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    try {
      const nuevoResultadoRef = push(ref(this.db, 'resultadosAhorcado'));
      await set(nuevoResultadoRef, {
        uid: usuario.uid,
        usuario: usuario.nombre,
        correo: usuario.correo,
        palabra: this.palabraSecreta(),
        resultado: estado,
        tiempoFinalizacionSegundos: this.tiempoSegundos(),
        cantidadLetrasSeleccionadas: this.letrasSeleccionadas().length,
        fechaPartida: new Date().toISOString()
      });
      console.log('Resultado del juego guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
    }
  }

  // metodos del cronometro
  private iniciarCronometro(): void {
    this.intervaloCronometro = setInterval(() => {
      this.tiempoSegundos.update(s => s + 1);
    }, 1000);
  }

  private detenerCronometro(): void {
    if (this.intervaloCronometro) {
      clearInterval(this.intervaloCronometro);
    }
  }

  // Formatea los segundos a un string mm:ss
  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoSegundos() / 60);
    const segundos = this.tiempoSegundos() % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }
}