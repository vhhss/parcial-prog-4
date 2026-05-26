import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { Whoami } from './components/whoami/whoami';

export const routes: Routes = [
  // "pathMatch: 'full'" significa que la URL debe estar completamente vacía para que esto ocurra.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Angular carga el componente correspondiente adentro de la etiqueta <router-outlet> del HTML principal (app.html).
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'whoami', component: Whoami },
  { path: '**', redirectTo: 'home' }
];

export default routes;