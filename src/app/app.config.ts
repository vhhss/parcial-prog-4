import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), 
    //hydratation es el proceso q angular toma el html estatico y lo vuelve interactivo
    //withEventReplay es una estrategia de hidratacion que reenvia los eventos del cliente al servidor para que el servidor pueda procesarlos y actualizar el estado de la aplicacion en consecuencia
    provideHttpClient(withFetch())
    //withFetch usa la API moderna de Fetch del navegador en lugar de tecnologías viejas.
  ]
};
