import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-menu',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css'],
})
export class AdminMenuComponent {
  currentUrl = '';

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl = (event as NavigationEnd).urlAfterRedirects;
    });
  }

  navigate(path: string, event: Event) {
    event.preventDefault();
    this.router.navigateByUrl(path);
  }
}
