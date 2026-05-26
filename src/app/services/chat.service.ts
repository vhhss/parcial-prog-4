import { Injectable, inject, signal } from '@angular/core';
import { Database, ref, push, set, onValue, query, limitToLast } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private db = inject(Database);

  // Signal reactivo para mantener la lista de mensajes actualizada
  mensajes = signal<any[]>([]);

  constructor() {
    this.cargarMensajesEnTiempoReal();
  }

  // CONEXIÓN EN TIEMPO REAL (Suscripción activa)
  private cargarMensajesEnTiempoReal() {
    // Apuntamos a la carpeta 'chats' en la base de datos y limitamos a los últimos 50 mensajes
    const chatRef = query(ref(this.db, 'chats'), limitToLast(50));

    // 'onValue' se queda escuchando. Cada vez que alguien mande un mensaje, este bloque se ejecuta solo.
    onValue(chatRef, (snapshot) => {
      const lista: any[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          lista.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      // Actualizamos el Signal con los mensajes ordenados
      this.mensajes.set(lista);
    });
  }

  // ENVIAR MENSAJE A LA BASE DE DATOS
  async enviarMensaje(texto: string, usuario: any): Promise<void> {
    if (!texto.trim()) return;

    const nuevoMensajeRef = push(ref(this.db, 'chats'));
    
    const datosMensaje = {
      texto: texto,
      uid: usuario.uid,
      correo: usuario.correo,
      nombre: usuario.nombre,
      // Guardamos la fecha en formato ISO string y la hora legible local
      fechaEnvio: new Date().toISOString(),
      horaLegible: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Impacta en la Realtime Database
    await set(nuevoMensajeRef, datosMensaje);
  }
}