import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-whoami',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whoami.html',
  styleUrl: './whoami.css'
})
export class Whoami implements OnInit {
  datosGithub = signal<any>(null);
  errorApi: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('https://api.github.com/users/vhhss').subscribe({
      next: (data) => {
        this.datosGithub.set(data);
      },
      error: (err) => {
        this.errorApi = true;
        console.error('Error con la API de GitHub:', err);
      }
    });
  }
}