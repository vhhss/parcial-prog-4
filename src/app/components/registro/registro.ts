import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro {
  private authService = inject(AuthService);

  correo: string = '';
  contrasenia: string = '';
  nombre: string = '';
  apellido: string = '';
  edad!: number;
  mensajeError = signal<string | null>(null);
  
  // Controla el estado visual del spinner en el botón de envío
  cargando = signal<boolean>(false);

  async onRegistro() {
    this.mensajeError.set(null);
    if (!this.correo || !this.contrasenia || !this.nombre || !this.apellido || !this.edad) {
      this.mensajeError.set('Por favor, complete todos los campos del formulario.');
      return;
    }

    this.cargando.set(true); // Encendemos la animación
    
    try {
      await this.authService.registrar(this.correo, this.contrasenia, this.nombre, this.apellido, this.edad);
    } catch (err: any) {
      this.mensajeError.set(err);
    } finally {
      this.cargando.set(false); // Apagamos la animación al terminar
    }
  }
}