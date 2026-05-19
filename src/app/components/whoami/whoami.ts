import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubService } from '../../services/github';
import { GithubUser } from '../../interfaces/github-user';

@Component({
  selector: 'app-whoami',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whoami.html',
  styleUrl: './whoami.css'
})
export class Whoami implements OnInit {
  // Cambiamos signal<any> por el tipo de nuestra interfaz o null
  datosGithub = signal<GithubUser | null>(null);
  errorApi: boolean = false;

  // Inyectamos el nuevo servicio que creamos
  private githubService = inject(GithubService);

  ngOnInit(): void {
    // Usamos el servicio pasándole tu usuario de GitHub
    this.githubService.getUserProfile('vhhss').subscribe({
      next: (data) => {
        this.datosGithub.set(data); // El Signal se actualiza de forma segura y tipada
      },
      error: (err) => {
        this.errorApi = true;
        console.error('Error con la API de GitHub:', err);
      }
    });
  }
}