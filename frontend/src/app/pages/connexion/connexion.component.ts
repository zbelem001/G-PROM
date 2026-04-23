import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-connexion',
  imports: [CommonModule],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css'],
})
export class ConnexionComponent {
  constructor(private router: Router) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard']);
  }
}
