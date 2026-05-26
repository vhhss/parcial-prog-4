import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { Database, ref, push, set } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { Carta } from '../../interfaces/carta';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css'
})
export class MayorMenor implements OnInit {
  // Inyección de servicios globales
  private db = inject(Database);
  public authService = inject(AuthService);

  // signals para manejar el estado del juego
  cartaActual = signal<Carta | null>(null);
  cartaNueva = signal<Carta | null>(null);
  puntuacion = signal<number>(0);
  juegoTerminado = signal<boolean>(false);
  mensajeFeedback = signal<string>('¿La próxima carta será Mayor o Menor?');
  claseFeedback = signal<string>('alert-info');

  // Mazo de cartas lógico
  private mazo: Carta[] = [];

  ngOnInit(): void {
    this.iniciarJuego();
  }

  // Inicializa o reinicia todas las variables del juego
  iniciarJuego(): void {
    this.mazo = [];
    const palos: ('Oro' | 'Copa' | 'Espada' | 'Basto')[] = ['Oro', 'Copa', 'Espada', 'Basto'];

    // Llenamos el mazo con cartas del 1 al 12 para cada palo
    for (const palo of palos) {
      for (let i = 1; i <= 12; i++) {
        this.mazo.push({ numero: i, palo: palo });
      }
    }

    // Mezclamos el mazo usando el algoritmo de Fisher-Yates
    this.mezclarMazo();

    // Sacamos la primera carta para mostrar en pantalla
    this.cartaActual.set(this.mazo.pop() || null);
    this.cartaNueva.set(null);
    
    // Resetear estados
    this.puntuacion.set(0);
    this.juegoTerminado.set(false);
    this.mensajeFeedback.set('¡Mazo mezclado! ¿La próxima carta será Mayor o Menor?');
    this.claseFeedback.set('alert-info');
  }

  private mezclarMazo(): void {
    for (let i = this.mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.mazo[i], this.mazo[j]] = [this.mazo[j], this.mazo[i]];
    }
  }

  // Dispara el intento cuando el usuario hace click en un botón de apuesta
  evaluarApuesta(eleccion: 'MAYOR' | 'MENOR'): void {
    // si el juego ya terminó o el mazo quedó vacío, frenamos
    if (this.juegoTerminado() || this.mazo.length === 0) return;

    // Sacamos la siguiente carta del mazo mezclado
    const proximaCarta = this.mazo.pop();
    if (!proximaCarta) return;

    this.cartaNueva.set(proximaCarta);
    const numeroActual = this.cartaActual()!.numero;
    const numeroNuevo = proximaCarta.numero;

    // verifica si el usuario acertó
    let ganoIntento = false;

    if (numeroNuevo === numeroActual) {
      // si los números son iguales se considera acierto por cortesía
      ganoIntento = true;
    } else if (eleccion === 'MAYOR' && numeroNuevo > numeroActual) {
      ganoIntento = true;
    } else if (eleccion === 'MENOR' && numeroNuevo < numeroActual) {
      ganoIntento = true;
    }

    if (ganoIntento) {
      // accierto: Suma un punto y la carta nueva pasa a ser la actual
      this.puntuacion.update(p => p + 1);
      this.mensajeFeedback.set(`¡Acertaste! Salió el ${numeroNuevo} de ${proximaCarta.palo}.`);
      this.claseFeedback.set('alert-success');
      
      // hace el pase de cartas diferido para dar tiempo visual
      setTimeout(() => {
        this.cartaActual.set(proximaCarta);
        this.cartaNueva.set(null);
      }, 1200); 
    } else {
      // fallo: Fin de la partida
      this.mensajeFeedback.set(`¡Perdiste! Salió el ${numeroNuevo} de ${proximaCarta.palo}.`);
      this.claseFeedback.set('alert-danger');
      this.finalizarPartida();
    }
  }

  private async finalizarPartida(): Promise<void> {
    this.juegoTerminado.set(true);

    // Guardar estadísticas en la db
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    try {
      const nuevoResultadoRef = push(ref(this.db, 'resultadosMayorMenor'));
      await set(nuevoResultadoRef, {
        uid: usuario.uid,
        usuario: usuario.nombre,
        correo: usuario.correo,
        cartasAcertadas: this.puntuacion(),
        fechaPartida: new Date().toISOString()
      });
      console.log('Estadísticas de Mayor o Menor guardadas exitosamente.');
    } catch (error) {
      console.error('Error al guardar el puntaje:', error);
    }
  }
}