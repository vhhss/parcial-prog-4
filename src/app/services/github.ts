import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GithubUser } from '../interfaces/github-user';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio sea global y reutilizable en cualquier componente
})
export class GithubService {
  // Inyectamos HttpClient de la forma moderna de Angular 19
  private http = inject(HttpClient); 

  // Este método devuelve un Observable tipado estrictamente con nuestra interfaz
  getUserProfile(username: string): Observable<GithubUser> {
    return this.http.get<GithubUser>(`https://api.github.com/users/${username}`);
  }
}