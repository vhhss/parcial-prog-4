import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Importaciones limpias de Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database'; // <-- CAMBIO CLAVE

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
    provideHttpClient(withFetch()),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()) // <-- Prendemos Realtime Database en lugar de Firestore
  ]
};