import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private authService = inject(AuthService);

  correo: string = '';
  contrasenia: string = '';
  mensajeError = signal<string | null>(null);

  async onSubmit() {
    this.mensajeError.set(null);
    try {
      await this.authService.login(this.correo, this.contrasenia);
    } catch (err: any) {
      this.mensajeError.set(err);
    }
  }

  // Sistema de autocompletado rápido requerido para las pruebas dinámicas
  cargarAccesoRapido(perfil: string) {
    this.mensajeError.set(null);
    if (perfil === 'admin') {
      this.correo = 'admin@sala.com';
      this.contrasenia = 'admin123';
    } else if (perfil === 'invitado') {
      this.correo = 'invitado@sala.com';
      this.contrasenia = 'invitado123';
    } else if (perfil === 'tester') {
      this.correo = 'tester@sala.com';
      this.contrasenia = 'tester123';
    }
  }
}