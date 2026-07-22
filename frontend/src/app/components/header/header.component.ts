import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getUser } from '../../../session';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  displayName = '';
  initials = 'U';
  role = '';

  ngOnInit() {
    const user = getUser();
    if (!user) return;
    const full = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
    this.displayName = full || user.nomutilisateur;
    this.role = user.role === 'admin' ? 'Administrateur' : 'Utilisateur';
    this.initials = this.displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';
  }
}
