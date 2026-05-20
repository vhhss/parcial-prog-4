import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { take } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

export const invitadoGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Le preguntamos directamente al flujo de Firebase Auth y esperamos la primera respuesta real
  const usuarioFirebase = await firstValueFrom(authState(auth).pipe(take(1)));

  // Si Firebase dice que el usuario SÍ tiene sesión activa en el navegador
  if (usuarioFirebase) {
    // Lo mandamos al Home y le cerramos la puerta al Login/Registro
    router.navigate(['/home']);
    return false;
  }

  // Si no hay nadie (es null), lo dejamos pasar al formulario
  return true;
};