import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Whoami } from './components/whoami/whoami';
import { Chat } from './components/chat/chat'; 
import { Ahorcado } from './components/ahorcado/ahorcado'; 
import { MayorMenor } from './components/mayor-menor/mayor-menor';
import { Preguntados } from './components/preguntados/preguntados';
import { Buscaminas } from './components/buscaminas/buscaminas';
import { authGuard } from './guards/auth.guard'; // Valida que el usuario ESTÉ logueado
import { invitadoGuard } from './guards/invitado.guard'; // Valida que el usuario NO ESTÉ logueado

export const routes: Routes = [
  // "pathMatch: 'full'" significa que la URL debe estar completamente vacía para que esto ocurra.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Angular carga el componente correspondiente adentro de la etiqueta <router-outlet> del HTML principal (app.html).
  { path: 'home', component: Home },
  
  // RUTAS PROTEGIDAS PARA INVITADOS: Si intentan entrar acá estando logueados, el guard los saca al Home
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  
  { path: 'whoami', component: Whoami },
  
  // RUTAS PROTEGIDAS PARA USUARIOS LOGUEADOS: Si intentan entrar sin loguearse, el Guard los rebota al Login
  { path: 'chat', component: Chat, canActivate: [authGuard] },
  { path: 'juegos/ahorcado', component: Ahorcado, canActivate: [authGuard] },
  { path: 'juegos/mayor-menor', component: MayorMenor, canActivate: [authGuard] },
  { path: 'juegos/preguntados', component: Preguntados, canActivate: [authGuard] },
  { path: 'juegos/buscaminas', component: Buscaminas, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'home' }
];

export default routes;