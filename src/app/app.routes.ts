import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Whoami } from './components/whoami/whoami';
import { authGuard } from './guards/auth.guard'; // Importamos el Guard que valida la sesión

export const routes: Routes = [
  // "pathMatch: 'full'" significa que la URL debe estar completamente vacía para que esto ocurra.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Angular carga el componente correspondiente adentro de la etiqueta <router-outlet> del HTML principal (app.html).
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'whoami', component: Whoami },
  
  // RUTA PROTEGIDA: Si intentan entrar a un juego sin loguearse, el Guard los rebota al Login
  { 
    path: 'juegos/buscaminas', 
    component: Whoami, // Temporalmente apunta a Whoami hasta que crees el Buscaminas en el Sprint 3
    canActivate: [authGuard] 
  },
  
  { path: '**', redirectTo: 'home' }
];

export default routes;