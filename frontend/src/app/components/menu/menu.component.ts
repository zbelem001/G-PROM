import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  currentUrl = '';
  isAdmin = false;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl = (event as NavigationEnd).urlAfterRedirects;
    });

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('gprom_user');
        const user = raw ? JSON.parse(raw) : null;
        this.isAdmin = user?.role === 'admin';
      } catch {
        this.isAdmin = false;
      }
    }
  }

  navigate(path: string, event: Event) {
    console.debug('[Menu] click', path, event.type);
    event.preventDefault();
    this.router.navigateByUrl(path);
  }

  logout(event: Event) {
    event.preventDefault();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('gprom_token');
      window.localStorage.removeItem('gprom_user');
    }
    this.router.navigateByUrl('/connexion');
  }

  isDetailsRoute(section: 'marches' | 'fournisseurs'): boolean {
    if (section === 'marches') {
      return this.currentUrl.startsWith('/marches/details');
    }
    return this.currentUrl.startsWith('/fournisseurs/details');
  }
}
