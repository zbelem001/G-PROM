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

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl = (event as NavigationEnd).urlAfterRedirects;
    });
  }

  navigate(path: string, event: Event) {
    console.debug('[Menu] click', path, event.type);
    event.preventDefault();
    this.router.navigateByUrl(path);
  }

  isDetailsRoute(section: 'marches' | 'fournisseurs'): boolean {
    if (section === 'marches') {
      return this.currentUrl.startsWith('/marches/details');
    }
    return this.currentUrl.startsWith('/fournisseurs/details');
  }
}
