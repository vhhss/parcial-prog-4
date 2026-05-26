import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  // Inyectamos los servicios necesarios
  public chatService = inject(ChatService);
  public authService = inject(AuthService);

  // Signal local para controlar el texto que escribe el usuario en el input
  nuevoMensaje = signal<string>('');

  // Método que se ejecuta al clickear "Enviar" o apretar Enter
  async enviar() {
    const texto = this.nuevoMensaje().trim();
    const usuario = this.authService.usuarioActual();

    // Si el texto está vacío o el usuario de alguna forma no existe, frenamos
    if (!texto || !usuario) return;

    try {
      // Mandamos el mensaje al servicio para que impacte en la base de datos
      await this.chatService.enviarMensaje(texto, usuario);
      
      // Limpiamos el input del chat para el próximo mensaje
      this.nuevoMensaje.set('');
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  }
}