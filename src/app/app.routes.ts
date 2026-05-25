import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Whoami } from './components/whoami/whoami';
import { Chat } from './components/chat/chat'; // <-- 1. Importamos el nuevo componente del Chat
import { authGuard } from './guards/auth.guard'; // Valida que el usuario ESTÉ logueado
import { invitadoGuard } from './guards/invitado.guard'; // Valida que el usuario NO ESTÉ logueado

export const routes: Routes = [
  // "pathMatch: 'full'" significa que la URL debe estar completamente vacía para que esto ocurra.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Angular carga el componente correspondiente adentro de la etiqueta <router-outlet> del HTML principal (app.html).
  { path: 'home', component: Home },
  
  // RUTAS PROTEGIDAS PARA INVITADOS: Si intentan entrar acá estando logueados, el guard los saca volando al Home
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  
  { path: 'whoami', component: Whoami },
  
  // RUTA PROTEGIDA PARA EL CHAT GLOBAL (Solo usuarios logueados)
  { path: 'chat', component: Chat, canActivate: [authGuard] },
  
  // RUTA PROTEGIDA PARA USUARIOS: Si intentan entrar a un juego sin loguearse, el Guard los rebota al Login
  { 
    path: 'juegos/buscaminas', 
    component: Whoami, // Temporalmente apunta a Whoami hasta que crees el Buscaminas en el Sprint 3
    canActivate: [authGuard] 
  },
  
  { path: '**', redirectTo: 'home' }
];

export default routes;