import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el Signal tiene datos (usuario real o de prueba), se habilita la ruta
  if (authService.usuarioActual() !== null) {
    return true;
  }

  // Si no está logueado, lo mandamos al login de prepo
  console.warn('Acceso denegado: Se requiere inicio de sesión.');
  router.navigate(['/login']);
  return false;
};