import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { provideHttpClient, withFetch } from '@angular/common/http';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKnCPZfGeDejOI0WHh1ZWIEzdPzslZZqo",
  authDomain: "sala-de-juegos-utn-d2cba.firebaseapp.com",
  projectId: "sala-de-juegos-utn-d2cba",
  storageBucket: "sala-de-juegos-utn-d2cba.firebasestorage.app",
  messagingSenderId: "849931733944",
  appId: "1:849931733944:web:655017bc0ff341a6a49d4d",
  measurementId: "G-G9KKYPQE6J"
};


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()), 
    //hydratation es el proceso q angular toma el html estatico y lo vuelve interactivo
    //withEventReplay es una estrategia de hidratacion que reenvia los eventos del cliente al servidor para que el servidor pueda procesarlos y actualizar el estado de la aplicacion en consecuencia
    provideHttpClient(withFetch()),
    //withFetch usa la API moderna de Fetch del navegador en lugar de tecnologías viejas.

    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Enciende la conexión base con Firebase
    provideAuth(() => getAuth()),                            // Activa el servicio de usuarios (Login/Registro)
    provideFirestore(() => getFirestore())                   // Activa la base de datos para guardar campos extra
  ]
};
