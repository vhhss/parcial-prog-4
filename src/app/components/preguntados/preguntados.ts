import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Database, ref, push, set } from '@angular/fire/database';
import { AuthService } from '../../services/auth.service';
import { PokemonInfo } from '../../interfaces/pokemon';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css'
})
export class Preguntados implements OnInit {
  // Inyección de servicios
  private http = inject(HttpClient);
  private db = inject(Database);
  public authService = inject(AuthService);

  // signals para manejar el estado del juego
  pokemonActual = signal<PokemonInfo | null>(null);
  puntuacion = signal<number>(0);
  vidas = signal<number>(3); // 3 vidas para la trivia
  juegoTerminado = signal<boolean>(false);
  respondido = signal<boolean>(false);
  opcionSeleccionada = signal<string | null>(null);
  mensajeFeedback = signal<string>('¿Quién es este Pokémon?');
  claseFeedback = signal<string>('alert-info');
  cargando = signal<boolean>(false);

  ngOnInit(): void {
    this.iniciarJuego();
  }

  // Inicializa o reinicia todas las variables del juego
  iniciarJuego(): void {
    this.puntuacion.set(0);
    this.vidas.set(3);
    this.juegoTerminado.set(false);
    this.cargarSiguientePregunta();
  }

  // Conecta con la PokeAPI externa para armar el desafío en tiempo real
  async cargarSiguientePregunta(): Promise<void> {
    this.cargando.set(true);
    this.respondido.set(false);
    this.opcionSeleccionada.set(null);
    this.mensajeFeedback.set('¿Quién es este Pokémon?');
    this.claseFeedback.set('alert-info');

    try {
      // 1. Elegimos un ID de Pokémon random entre los primeros 151
      const idCorrecto = Math.floor(Math.random() * 151) + 1;
      
      // Llamada HTTP usando firstValueFrom para manejarlo con async/await de forma limpia
      const datosCorrectos: any = await firstValueFrom(
        this.http.get(`https://pokeapi.co/api/v2/pokemon/${idCorrecto}`)
      );

      const nombreCorrecto = datosCorrectos.name.toUpperCase();
      const imagenPokemon = datosCorrectos.sprites.other['official-artwork'].front_default;

      // 2. Traemos 3 nombres random falsos para rellenar los botones
      const nombresOpciones = [nombreCorrecto];
      while (nombresOpciones.length < 4) {
        const idFalso = Math.floor(Math.random() * 151) + 1;
        if (idFalso !== idCorrecto) {
          const datosFalsos: any = await firstValueFrom(
            this.http.get(`https://pokeapi.co/api/v2/pokemon/${idFalso}`)
          );
          const nombreFalso = datosFalsos.name.toUpperCase();
          if (!nombresOpciones.includes(nombreFalso)) {
            nombresOpciones.push(nombreFalso);
          }
        }
      }

      // 3. Mezclamos las opciones del array para que la correcta no quede siempre primera
      nombresOpciones.sort(() => Math.random() - 0.5);

      // Guardamos la info estructurada en el Signal
      this.pokemonActual.set({
        id: idCorrecto,
        nombre: nombreCorrecto,
        imagen: imagenPokemon,
        opciones: nombresOpciones
      });

    } catch (error) {
      console.error('Error al consumir la PokeAPI:', error);
      this.mensajeFeedback.set('Error de red al conectar con el servidor de Pokémon.');
      this.claseFeedback.set('alert-danger');
    } finally {
      this.cargando.set(false);
    }
  }

  // Dispara el intento cuando el usuario hace click en un botón de opción
  verificarRespuesta(opcion: string): void {
    if (this.respondido() || this.juegoTerminado()) return;

    this.respondido.set(true);
    this.opcionSeleccionada.set(opcion);
    const correcto = this.pokemonActual()?.nombre;

    if (opcion === correcto) {
      // accierto: Sumamos punto y avanzamos
      this.puntuacion.update(p => p + 1);
      this.mensajeFeedback.set(`¡Excelente! Es ${correcto}.`);
      this.claseFeedback.set('alert-success');
    } else {
      // fallo: Restamos una vida
      this.vidas.update(v => v - 1);
      this.mensajeFeedback.set(`¡Incorrecto! Era ${correcto}.`);
      this.claseFeedback.set('alert-danger');

      // verifica si se quedó sin vidas (Derrota)
      if (this.vidas() === 0) {
        this.finalizarPartida();
        return;
      }
    }

    // Delay de 2 segundos para pasar al próximo Pokémon de forma fluida
    setTimeout(() => {
      if (!this.juegoTerminado()) {
        this.cargarSiguientePregunta();
      }
    }, 2000);
  }

  private async finalizarPartida(): Promise<void> {
    this.juegoTerminado.set(true);

    // Guardar estadísticas en la db
    const usuario = this.authService.usuarioActual();
    if (!usuario) return;

    try {
      const nuevoResultadoRef = push(ref(this.db, 'resultadosPreguntados'));
      await set(nuevoResultadoRef, {
        uid: usuario.uid,
        usuario: usuario.nombre,
        correo: usuario.correo,
        preguntasAcertadas: this.puntuacion(),
        fechaPartida: new Date().toISOString()
      });
      console.log('Resultado de Preguntados guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el resultado:', error);
    }
  }
}