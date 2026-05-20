import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  // Signal global que almacena los datos custom del usuario o null si no está logueado
  usuarioActual = signal<any | null>(null);

  constructor() {
    // Escucha de forma activa los cambios del estado de autenticación de Firebase
    authState(this.auth).subscribe(async (user: User | null) => {
      if (user) {
        // Si el usuario está autenticado, buscamos sus datos complementarios en la base de datos Firestore
        const userDoc = await getDoc(doc(this.firestore, 'usuarios', user.uid));
        if (userDoc.exists()) {
          this.usuarioActual.set(userDoc.data());
        }
      } else {
        this.usuarioActual.set(null);
      }
    });
  }

  // INICIO DE SESIÓN
  async login(correo: string, contrasenia: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, correo, contrasenia);
      this.router.navigate(['/home']);
    } catch (error: any) {
      throw this.traducirError(error.code);
    }
  }

  // REGISTRO DE USUARIO Y GUARDADO EN FIRESTORE (LA CONTRASEÑA NO SE GUARDA EN BD)
  async registrar(correo: string, contrasenia: string, nombre: string, apellido: string, edad: number): Promise<void> {
    try {
      // Crea las credenciales de acceso seguras en Firebase Authentication
      const credenciales = await createUserWithEmailAndPassword(this.auth, correo, contrasenia);
      
      const datosUsuario = {
        uid: credenciales.user.uid,
        correo: correo,
        nombre: nombre,
        apellido: apellido,
        edad: edad
      };

      // Guarda el perfil extendido en la colección 'usuarios' de Cloud Firestore usando el mismo UID
      await setDoc(doc(this.firestore, 'usuarios', credenciales.user.uid), datosUsuario);
      
      this.usuarioActual.set(datosUsuario);
      this.router.navigate(['/home']);
    } catch (error: any) {
      throw this.traducirError(error.code);
    }
  }

  // CERRAR SESIÓN
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.usuarioActual.set(null);
    this.router.navigate(['/home']);
  }

  // TRADUCTOR OFICIAL DE EXCEPCIONES DE FIREBASE
  private traducirError(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'El correo electrónico o la contraseña ingresada son incorrectos.';
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya se encuentra registrado en el sistema.';
      case 'auth/invalid-email':
        return 'El formato del correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Debe contener al menos 6 caracteres.';
      default:
        return 'Ocurrió un inconveniente al procesar la solicitud. Intente nuevamente.';
    }
  }
}