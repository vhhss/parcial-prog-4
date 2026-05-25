import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Database, ref, get } from '@angular/fire/database';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css'
})
export class Resultados implements OnInit {
  // Inyección de servicios globales
  private db = inject(Database);

  // signals para almacenar los listados de métricas ordenados
  listaAhorcado = signal<any[]>([]);
  listaMayorMenor = signal<any[]>([]);
  listaPreguntados = signal<any[]>([]);
  listaBuscaminas = signal<any[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit(): void {
    this.cargarTodosLosResultados();
  }

  // Recupera los nodos históricos de firebase para cada juego, los ordena según el desempeño y los guarda en signals para mostrar en la tabla
  async cargarTodosLosResultados(): Promise<void> {
    this.cargando.set(true);
    try {
      // 1. Traer y ordenar registros de El Ahorcado (mejor desempeño: victorias y menor tiempo)
      const snapAhorcado = await get(ref(this.db, 'resultadosAhorcado'));
      if (snapAhorcado.exists()) {
        const datos = Object.values(snapAhorcado.val());
        datos.sort((a: any, b: any) => {
          if (a.resultado === b.resultado) {
            return a.tiempoFinalizacionSegundos - b.tiempoFinalizacionSegundos; // menor tiempo primero
          }
          return a.resultado === 'VICTORIA' ? -1 : 1; // victorias primero
        });
        this.listaAhorcado.set(datos);
      }

      // 2. Traer y ordenar registros de Mayor o Menor (mejor desempeño: más cartas acertadas)
      const snapMayorMenor = await get(ref(this.db, 'resultadosMayorMenor'));
      if (snapMayorMenor.exists()) {
        const datos = Object.values(snapMayorMenor.val());
        datos.sort((a: any, b: any) => b.cartasAcertadas - a.cartasAcertadas);
        this.listaMayorMenor.set(datos);
      }

      // 3. Traer y ordenar registros de Preguntados (mejor desempeño: más respuestas correctas)
      const snapPreguntados = await get(ref(this.db, 'resultadosPreguntados'));
      if (snapPreguntados.exists()) {
        const datos = Object.values(snapPreguntados.val());
        datos.sort((a: any, b: any) => b.preguntasAcertadas - a.preguntasAcertadas);
        this.listaPreguntados.set(datos);
      }

      // 4. Traer y ordenar registros de Buscaminas (mejor desempeño: victorias y más celdas limpias)
      const snapBuscaminas = await get(ref(this.db, 'resultadosBuscaminas'));
      if (snapBuscaminas.exists()) {
        const datos = Object.values(snapBuscaminas.val());
        datos.sort((a: any, b: any) => {
          if (a.resultado === b.resultado) {
            return b.casillerosDespejados - a.casillerosDespejados; // más celdas despejadas primero
          }
          return a.resultado === 'VICTORIA' ? -1 : 1; // victorias primero
        });
        this.listaBuscaminas.set(datos);
      }

    } catch (error) {
      console.error('Error al recuperar los ránkings de la base de datos:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  // Helper simple para formatear la duración del ahorcado en las celdas
  formatearTiempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }
}